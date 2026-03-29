"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  EARNINGS_CALENDAR,
  type EarningsEvent,
} from "@/data/earnings-calendar";
import {
  predictEarningsSurprise,
  type EarningsPrediction,
} from "@/services/market/earnings-model";
import { FUNDAMENTALS } from "@/data/fundamentals";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateSyntheticPrices(ticker: string): number[] {
  // Seeded simple prices for prediction model
  let seed = 0;
  for (let i = 0; i < ticker.length; i++) {
    seed = (seed * 31 + ticker.charCodeAt(i)) | 0;
  }
  const prices: number[] = [];
  let price = 100 + (seed % 200);
  for (let i = 0; i < 252; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const change = ((seed / 0x7fffffff) - 0.5) * 3;
    price = Math.max(10, price + change);
    prices.push(Math.round(price * 100) / 100);
  }
  return prices;
}

// ─── Beat Probability Meter ──────────────────────────────────────────────────

function BeatMeter({ probability }: { probability: number }) {
  const color =
    probability >= 65
      ? "bg-emerald-500"
      : probability >= 50
        ? "bg-amber-500"
        : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", color)}
          style={{ width: `${probability}%` }}
        />
      </div>
      <span className="font-mono tabular-nums text-xs font-medium w-8 text-right">
        {probability}%
      </span>
    </div>
  );
}

// ─── Surprise History Mini Chart (SVG) ───────────────────────────────────────

function SurpriseChart({
  history,
}: {
  history: EarningsEvent["surpriseHistory"];
}) {
  if (history.length === 0) return null;

  const w = 120;
  const h = 40;
  const padding = 4;
  const barWidth = (w - padding * 2) / history.length - 2;

  const maxVal = Math.max(
    ...history.map((h) => Math.abs(h.epsSurprise)),
    1,
  );
  const midY = h / 2;

  return (
    <svg width={w} height={h} className="shrink-0">
      {history.map((item, i) => {
        const x = padding + i * (barWidth + 2);
        const barH = (Math.abs(item.epsSurprise) / maxVal) * (h / 2 - padding);
        const y = item.epsSurprise >= 0 ? midY - barH : midY;
        const fill =
          item.epsSurprise >= 0
            ? "rgb(16, 185, 129)"
            : "rgb(239, 68, 68)";
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={barH}
            rx={1}
            fill={fill}
          />
        );
      })}
      {/* Zero line */}
      <line
        x1={padding}
        x2={w - padding}
        y1={midY}
        y2={midY}
        stroke="currentColor"
        strokeOpacity={0.2}
        strokeWidth={0.5}
      />
    </svg>
  );
}

// ─── Factor Badge ────────────────────────────────────────────────────────────

function FactorBadge({
  factor,
}: {
  factor: EarningsPrediction["factors"][number];
}) {
  const colors = {
    positive: "bg-emerald-500/5 text-emerald-500",
    negative: "bg-red-500/5 text-red-500",
    neutral: "bg-muted text-muted-foreground",
  };
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-muted-foreground truncate mr-2">
        {factor.name}
      </span>
      <span
        className={cn(
          "text-xs px-1.5 py-0.5 rounded font-medium shrink-0",
          colors[factor.signal],
        )}
      >
        {factor.signal}
      </span>
    </div>
  );
}

// ─── Earnings Card ───────────────────────────────────────────────────────────

function EarningsCard({
  event,
  prediction,
  expanded,
  onToggle,
}: {
  event: EarningsEvent;
  prediction: EarningsPrediction;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-lg border bg-card">
      <button
        onClick={onToggle}
        className="w-full p-3 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{event.ticker}</span>
            <span className="text-xs text-muted-foreground">
              {event.time === "BMO" ? "Before Open" : "After Close"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {event.date}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">
              Beat Probability
            </p>
            <BeatMeter probability={prediction.beatProbability} />
          </div>
          <SurpriseChart history={event.surpriseHistory} />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2">
          <div>
            <p className="text-xs text-muted-foreground">Est. EPS</p>
            <p className="font-mono tabular-nums text-xs font-medium">
              ${event.epsEstimate.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Model Pred.</p>
            <p
              className={cn(
                "font-mono tabular-nums text-xs font-medium",
                prediction.modelPrediction > event.epsEstimate
                  ? "text-emerald-500"
                  : prediction.modelPrediction < event.epsEstimate
                    ? "text-red-500"
                    : "",
              )}
            >
              ${prediction.modelPrediction.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Hist. Beat</p>
            <p className="font-mono tabular-nums text-xs font-medium">
              {prediction.historicalBeatRate}%
            </p>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t p-3 space-y-3">
          {/* Factor breakdown */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Factor Analysis
            </p>
            <div className="space-y-0.5">
              {prediction.factors.map((factor, i) => (
                <FactorBadge key={i} factor={factor} />
              ))}
            </div>
          </div>

          {/* Past surprises detail */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Recent Earnings History
            </p>
            <div className="grid grid-cols-4 gap-1">
              {event.surpriseHistory.map((h, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-muted-foreground">
                    {h.quarter}
                  </p>
                  <p
                    className={cn(
                      "font-mono tabular-nums text-xs font-medium",
                      h.epsSurprise >= 0
                        ? "text-emerald-500"
                        : "text-red-500",
                    )}
                  >
                    {h.epsSurprise >= 0 ? "+" : ""}
                    {h.epsSurprise.toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Educational note */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            {event.educationalNote}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function EarningsPanel() {
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null);

  // Generate predictions for all earnings events
  const predictions = useMemo(() => {
    const map = new Map<string, EarningsPrediction>();
    for (const event of EARNINGS_CALENDAR) {
      const prices = generateSyntheticPrices(event.ticker);
      const fund = FUNDAMENTALS[event.ticker];
      if (fund) {
        const pred = predictEarningsSurprise(event.ticker, prices, {
          sector: fund.sector,
          revenueGrowthYoY: fund.revenueGrowthYoY,
          grossMargin: fund.grossMargin,
          analystCount: fund.analystCount,
          lastEarningsResult: fund.lastEarningsResult,
        });
        map.set(event.ticker, pred);
      }
    }
    return map;
  }, []);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Earnings Calendar</h3>
        <span className="text-xs text-muted-foreground">
          {EARNINGS_CALENDAR.length} upcoming
        </span>
      </div>

      {/* Earnings cards */}
      <div className="space-y-2">
        {EARNINGS_CALENDAR.map((event) => {
          const prediction = predictions.get(event.ticker);
          if (!prediction) return null;
          return (
            <EarningsCard
              key={event.ticker}
              event={event}
              prediction={prediction}
              expanded={expandedTicker === event.ticker}
              onToggle={() =>
                setExpandedTicker(
                  expandedTicker === event.ticker ? null : event.ticker,
                )
              }
            />
          );
        })}
      </div>

      {/* Model disclaimer */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        Beat probabilities are generated by a simplified model using price
        momentum, analyst revision proxies, and sector patterns. This is for
        educational purposes only and should not be used for actual trading
        decisions.
      </p>
    </div>
  );
}
