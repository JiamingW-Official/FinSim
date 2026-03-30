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
    <div className="rounded-xl border border-border/20 bg-card/30 p-3 transition-colors hover:border-border/30">
      {/* Header */}
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <h3 className="text-[11px] font-medium leading-snug text-foreground/80">
          {market.question}
        </h3>
        <span
          className={cn(
            "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider",
            CATEGORY_COLORS[market.category],
          )}
        >
          {CATEGORY_LABELS[market.category]}
        </span>
      </div>

      {/* Probability bar */}
      <div className="mb-2.5">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">
            Consensus
          </span>
          <span className="text-[9px] font-mono tabular-nums text-muted-foreground/35">
            {market.initialProbability}% YES
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-emerald-500/60 transition-all duration-300"
            style={{ width: `${market.initialProbability}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[9px] font-mono tabular-nums text-muted-foreground/35">
            {market.initialProbability}% Yes
          </span>
          <span className="text-[9px] font-mono tabular-nums text-muted-foreground/35">
            {100 - market.initialProbability}% No
          </span>
        </div>
      </div>

      {/* Meta row: difficulty + expiry */}
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {difficultyDots.map((filled, i) => (
            <div
              key={i}
              className={cn(
                "h-1 w-1 rounded-full",
                filled ? "bg-foreground/40" : "bg-foreground/10",
              )}
            />
          ))}
          <span className="ml-1 text-[9px] font-mono text-muted-foreground/35">
            {market.difficulty === 1
              ? "Easy"
              : market.difficulty === 2
              ? "Medium"
              : "Hard"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground/35">
          <Clock className="h-2.5 w-2.5" />
          <span className="text-[9px] font-mono">{market.expiresInDays}d</span>
        </div>
      </div>

      {/* Existing bet display */}
      {existingBet && <ExistingBetBadge bet={existingBet} market={market} />}

      {/* YES / NO buttons */}
      {!existingBet && !showBetForm && (
        <div className="mb-2 flex gap-1.5">
          <button
            onClick={() => {
              setShowBetForm("yes");
              setBetProbability(market.initialProbability);
            }}
            className="flex-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[9px] font-mono uppercase tracking-wider text-emerald-400/80 transition-colors hover:bg-emerald-500/15"
          >
            Yes {market.initialProbability}%
          </button>
          <button
            onClick={() => {
              setShowBetForm("no");
              setBetProbability(100 - market.initialProbability);
            }}
            className="flex-1 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[9px] font-mono uppercase tracking-wider text-rose-400/80 transition-colors hover:bg-rose-500/15"
          >
            No {100 - market.initialProbability}%
          </button>
        </div>
      )}

      {/* Inline bet form */}
      {showBetForm && !existingBet && (
        <div className="mb-2 rounded-lg border border-border/20 bg-card/50 p-2.5">
          <div className="mb-2 text-[9px] font-mono uppercase tracking-wider text-muted-foreground/50">
            Bet{" "}
            <span
              className={
                showBetForm === "yes" ? "text-emerald-400/80" : "text-rose-400/80"
              }
            >
              {showBetForm.toUpperCase()}
            </span>
          </div>

          {/* Amount slider */}
          <div className="mb-2.5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">
                Amount
              </span>
              <span className="text-[9px] font-mono tabular-nums text-muted-foreground/50">
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
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-foreground/10 accent-primary"
            />
            <div className="mt-0.5 flex justify-between text-[9px] font-mono text-muted-foreground/35">
              <span>10</span>
              <span>{Math.min(100, insightPoints)}</span>
            </div>
          </div>

          {/* Probability slider */}
          <div className="mb-2.5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">
                Your estimate
              </span>
              <span className="text-[9px] font-mono tabular-nums text-muted-foreground/50">
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
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-foreground/10 accent-primary"
            />
            <div className="mt-0.5 flex justify-between text-[9px] font-mono text-muted-foreground/35">
              <span>1%</span>
              <span>99%</span>
            </div>
          </div>

          {/* Payout preview */}
          <div className="mb-2.5 flex items-center justify-between rounded bg-foreground/5 px-2 py-1.5">
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">
              Payout
            </span>
            <span className="text-[9px] font-mono tabular-nums text-emerald-400/80">
              {expectedPayout} pts
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlaceBet}
              disabled={betAmount > insightPoints}
              className="flex-1 rounded-full bg-primary/90 px-3 py-1 text-[9px] font-mono uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary disabled:opacity-50"
            >
              Place Bet
            </button>
            <button
              onClick={() => setShowBetForm(null)}
              className="text-[9px] font-mono text-muted-foreground/40 transition-colors hover:text-muted-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Learn why toggle */}
      <button
        onClick={() => setShowLearnWhy(!showLearnWhy)}
        className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground/35 transition-colors hover:text-muted-foreground/60"
      >
        {showLearnWhy ? (
          <ChevronUp className="h-2.5 w-2.5" />
        ) : (
          <ChevronDown className="h-2.5 w-2.5" />
        )}
        Learn why this matters
      </button>
      {showLearnWhy && (
        <div className="mt-2 rounded-lg border border-border/20 bg-card/30 p-2 text-[9px] leading-relaxed text-muted-foreground/50">
          {market.educationalNote}
          <div className="mt-1.5 flex flex-wrap gap-1">
            {market.relatedConcepts.map((concept) => (
              <span
                key={concept}
                className="rounded border border-border/20 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground/35"
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
    <div className="mb-2 rounded-lg border border-border/20 bg-card/30 px-2.5 py-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider",
              bet.position === "yes"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400/80"
                : "border-rose-500/20 bg-rose-500/10 text-rose-400/80",
            )}
          >
            {bet.position.toUpperCase()}
          </span>
          <span className="text-[9px] font-mono tabular-nums text-muted-foreground/35">
            {bet.amount} pts @ {Math.round(bet.probability * 100)}%
          </span>
        </div>
        <span className="text-[9px] font-mono tabular-nums text-muted-foreground/50">
          {expectedPayout} pts
        </span>
      </div>
    </div>
  );
}
