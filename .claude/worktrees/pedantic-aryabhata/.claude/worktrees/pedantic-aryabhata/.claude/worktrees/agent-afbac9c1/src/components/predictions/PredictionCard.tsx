"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  BarChart3,
  Users,
  TrendingUp,
  Flame,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PredictionMarket } from "@/data/prediction-markets";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  PREDICTION_MARKETS,
} from "@/data/prediction-markets";
import { usePredictionMarketStore } from "@/stores/prediction-market-store";
import type { PredictionBet } from "@/stores/prediction-market-store";

interface PredictionCardProps {
  market: PredictionMarket;
  onNavigate?: (marketId: string) => void;
}

// ── Mini SVG sparkline ──
function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const w = 64;
  const h = 22;
  const pad = 1;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
      const y = pad + (1 - (v - min) / range) * (h - 2 * pad);
      return `${x},${y}`;
    })
    .join(" ");

  const trend = data[data.length - 1] - data[0];
  const color = trend > 2 ? "#22c55e" : trend < -2 ? "#ef4444" : "#a1a1aa";

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={className}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

export function PredictionCard({ market, onNavigate }: PredictionCardProps) {
  const [showBetForm, setShowBetForm] = useState<"yes" | "no" | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [betAmount, setBetAmount] = useState(50);
  const [betProbability, setBetProbability] = useState(market.probability);

  const placeBet = usePredictionMarketStore((s) => s.placeBet);
  const insightPoints = usePredictionMarketStore((s) => s.insightPoints);
  const existingBet = usePredictionMarketStore((s) =>
    s.getMarketBet(market.id),
  );

  const expectedPayout = useMemo(() => {
    if (!showBetForm) return 0;
    const prob = betProbability / 100;
    if (showBetForm === "yes") {
      return Math.round(betAmount * (1 / prob));
    }
    return Math.round(betAmount * (1 / (1 - prob)));
  }, [showBetForm, betAmount, betProbability]);

  const impliedReturn = useMemo(() => {
    if (!showBetForm || expectedPayout === 0) return 0;
    return Math.round(((expectedPayout - betAmount) / betAmount) * 100);
  }, [showBetForm, expectedPayout, betAmount]);

  const handlePlaceBet = () => {
    if (!showBetForm) return;
    if (betAmount > insightPoints) return;
    placeBet(market.id, showBetForm, betAmount, betProbability);
    setShowBetForm(null);
  };

  const daysLeft = daysUntil(market.closesAt);
  const isHot = market.volume > 250000;
  const difficultyDots = Array.from(
    { length: 3 },
    (_, i) => i < market.difficulty,
  );

  // Historical base comparison
  const baseDiff = market.probability - market.historicalBase;

  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-border/60">
      {/* Header */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-1.5">
            <span
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-medium",
                CATEGORY_COLORS[market.category],
              )}
            >
              {CATEGORY_LABELS[market.category]}
            </span>
            {isHot && (
              <span className="flex items-center gap-0.5 rounded bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-medium text-orange-400">
                <Flame className="h-2.5 w-2.5" />
                Hot
              </span>
            )}
            {market.difficulty === 3 && (
              <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
                Advanced
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium leading-snug text-foreground">
            {market.question}
          </h3>
        </div>
        <Sparkline data={market.priceHistory} className="shrink-0 mt-1" />
      </div>

      {/* Probability bar */}
      <div className="mb-2">
        <div className="mb-1 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Market probability</span>
          <span className="font-mono tabular-nums text-lg font-semibold text-foreground">
            {market.probability}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
          <div
            className="h-full rounded-full bg-green-500/60 transition-all duration-300"
            style={{ width: `${market.probability}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>
            {market.probability}% Yes / {100 - market.probability}% No
          </span>
          <span
            className={cn(
              "font-medium",
              baseDiff > 5
                ? "text-green-400"
                : baseDiff < -5
                  ? "text-red-400"
                  : "text-muted-foreground",
            )}
          >
            Base rate: {market.historicalBase}%
            {baseDiff > 5
              ? " (above)"
              : baseDiff < -5
                ? " (below)"
                : ""}
          </span>
        </div>
      </div>

      {/* Meta row: volume, liquidity, holders, days remaining */}
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono tabular-nums text-[10px] text-muted-foreground">
        <span className="flex items-center gap-0.5">
          <BarChart3 className="h-3 w-3" />
          {formatVolume(market.volume)} vol
        </span>
        <span className="flex items-center gap-0.5">
          <TrendingUp className="h-3 w-3" />
          {formatVolume(market.liquidity)} liq
        </span>
        <span className="flex items-center gap-0.5">
          <Users className="h-3 w-3" />
          {(market.yesHolders + market.noHolders).toLocaleString()} traders
        </span>
        <span className="flex items-center gap-0.5">
          <Clock className="h-3 w-3" />
          {daysLeft}d left
        </span>
        <div className="flex items-center gap-0.5">
          {difficultyDots.map((filled, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                filled ? "bg-foreground/60" : "bg-muted-foreground/20",
              )}
            />
          ))}
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
              setBetProbability(market.probability);
            }}
            className="flex-1 rounded-md bg-green-500/8 px-3 py-1.5 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/15"
          >
            Buy Yes {market.probability}c
          </button>
          <button
            onClick={() => {
              setShowBetForm("no");
              setBetProbability(100 - market.probability);
            }}
            className="flex-1 rounded-md bg-red-500/8 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/15"
          >
            Buy No {100 - market.probability}c
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
                showBetForm === "yes" ? "text-green-400" : "text-red-400"
              }
            >
              {showBetForm.toUpperCase()}
            </span>
          </div>

          {/* Amount slider */}
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Amount</span>
              <span className="font-medium text-foreground">
                {betAmount} pts
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={Math.min(500, insightPoints)}
              step={10}
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
            <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground">
              <span>10</span>
              <span>{Math.min(500, insightPoints)}</span>
            </div>
          </div>

          {/* Probability slider */}
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
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
            <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground">
              <span>1%</span>
              <span>99%</span>
            </div>
          </div>

          {/* Payout preview */}
          <div className="mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="rounded bg-muted/50 px-2 py-1.5 text-center">
              <div className="text-[9px] text-muted-foreground">Cost</div>
              <div className="text-xs font-semibold text-foreground">
                {betAmount}
              </div>
            </div>
            <div className="rounded bg-muted/50 px-2 py-1.5 text-center">
              <div className="text-[9px] text-muted-foreground">Payout</div>
              <div className="text-xs font-semibold text-green-400">
                {expectedPayout}
              </div>
            </div>
            <div className="rounded bg-muted/50 px-2 py-1.5 text-center">
              <div className="text-[9px] text-muted-foreground">Return</div>
              <div
                className={cn(
                  "text-xs font-semibold",
                  impliedReturn > 0
                    ? "text-green-400"
                    : "text-muted-foreground",
                )}
              >
                +{impliedReturn}%
              </div>
            </div>
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

      {/* Analysis toggle */}
      <button
        onClick={() => setShowAnalysis(!showAnalysis)}
        className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
      >
        {showAnalysis ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
        Analysis & factors
      </button>

      {showAnalysis && (
        <div className="mt-2 space-y-2">
          {/* Analysis factors */}
          <div className="rounded bg-muted/30 p-2.5">
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Key Factors
            </div>
            <ul className="space-y-1">
              {market.analysisFactors.map((factor, i) => (
                <li
                  key={i}
                  className="flex gap-1.5 text-[11px] leading-relaxed text-muted-foreground"
                >
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary/50" />
                  {factor}
                </li>
              ))}
            </ul>
          </div>

          {/* Educational note */}
          <div className="rounded bg-muted/30 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
            {market.educationalNote}
          </div>

          {/* Resolution source + related markets */}
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-foreground/60">
              Source: {market.source}
            </span>
            {market.relatedMarkets.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Related:</span>
                {market.relatedMarkets.slice(0, 2).map((relId) => {
                  const rel = PREDICTION_MARKETS.find(
                    (m) => m.id === relId,
                  );
                  if (!rel) return null;
                  return (
                    <button
                      key={relId}
                      onClick={() => onNavigate?.(relId)}
                      className="flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 font-medium text-foreground/60 transition-colors hover:text-foreground"
                    >
                      <ExternalLink className="h-2.5 w-2.5" />
                      {rel.question.slice(0, 30)}...
                    </button>
                  );
                })}
              </div>
            )}
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

  // Mark-to-market P&L
  const currentProb = market.probability / 100;
  const mtmValue =
    bet.position === "yes"
      ? bet.amount * (currentProb / prob)
      : bet.amount * ((1 - currentProb) / (1 - prob));
  const pnl = mtmValue - bet.amount;
  const pnlPct = Math.round((pnl / bet.amount) * 100);

  return (
    <div className="mb-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-semibold",
              bet.position === "yes"
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400",
            )}
          >
            {bet.position.toUpperCase()}
          </span>
          <span className="text-muted-foreground">
            {bet.amount} pts at {Math.round(bet.probability * 100)}c
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[10px] font-medium",
              pnl >= 0 ? "text-green-400" : "text-red-400",
            )}
          >
            {pnl >= 0 ? "+" : ""}
            {Math.round(pnl)} ({pnl >= 0 ? "+" : ""}
            {pnlPct}%)
          </span>
          <span className="font-medium text-foreground">
            Max: {expectedPayout} pts
          </span>
        </div>
      </div>
    </div>
  );
}
