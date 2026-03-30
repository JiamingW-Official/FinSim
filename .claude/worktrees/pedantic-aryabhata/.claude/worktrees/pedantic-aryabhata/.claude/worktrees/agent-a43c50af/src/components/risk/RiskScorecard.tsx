"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Rating = "green" | "amber" | "red";

interface Factor {
  name: string;
  score: number; // 0–100
  rating: Rating;
  description: string;
  actions: string[];
}

// ── Score gauge SVG ───────────────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const W = 140;
  const H = 80;
  const cx = W / 2;
  const cy = H - 10;
  const r = 56;
  const strokeW = 8;

  // Gauge spans 180 degrees (semi-circle)
  const startAngle = Math.PI; // left
  const endAngle = 0; // right
  const pct = score / 100;
  const sweepAngle = Math.PI * pct; // 0 to PI

  // Arc path
  function polarToCartesian(angle: number) {
    return {
      x: cx + r * Math.cos(Math.PI - angle),
      y: cy - r * Math.sin(Math.PI - angle),
    };
  }

  const bgStart = polarToCartesian(0);
  const bgEnd = polarToCartesian(Math.PI);
  const fillEnd = polarToCartesian(sweepAngle);

  const fillColor =
    score >= 70 ? "hsl(142 71% 45%)" : score >= 40 ? "hsl(38 92% 50%)" : "hsl(var(--destructive))";

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      aria-label={`Risk score: ${score} out of 100`}
    >
      {/* Background arc */}
      <path
        d={`M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 0 1 ${bgEnd.x} ${bgEnd.y}`}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      {/* Fill arc */}
      {score > 0 && (
        <path
          d={`M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${fillEnd.x} ${fillEnd.y}`}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
      )}
      {/* Score text */}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontSize={22}
        fontWeight="700"
        fill={fillColor}
        fontFamily="inherit"
      >
        {score}
      </text>
      <text
        x={cx}
        y={cy + 9}
        textAnchor="middle"
        fontSize={8}
        fill="hsl(var(--muted-foreground))"
        fontFamily="inherit"
      >
        / 100
      </text>
    </svg>
  );
}

// ── Factor bar ────────────────────────────────────────────────────────────────

function FactorRow({ factor }: { factor: Factor }) {
  const Icon =
    factor.rating === "green"
      ? CheckCircle2
      : factor.rating === "amber"
      ? AlertTriangle
      : XCircle;

  const iconClass =
    factor.rating === "green"
      ? "text-green-500"
      : factor.rating === "amber"
      ? "text-amber-500"
      : "text-destructive";

  const fillClass =
    factor.rating === "green"
      ? "bg-green-500"
      : factor.rating === "amber"
      ? "bg-amber-500"
      : "bg-destructive";

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-3.5 w-3.5 shrink-0", iconClass)} />
        <span className="text-xs font-medium flex-1">{factor.name}</span>
        <span
          className={cn(
            "text-xs font-bold tabular-nums",
            factor.rating === "green"
              ? "text-green-500"
              : factor.rating === "amber"
              ? "text-amber-500"
              : "text-destructive",
          )}
        >
          {factor.score}
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", fillClass)}
          style={{ width: `${factor.score}%`, opacity: 0.8 }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">{factor.description}</p>
      {factor.actions.length > 0 && factor.rating !== "green" && (
        <div className="pl-2 space-y-0.5 mt-1">
          {factor.actions.map((a, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground/80">
              <span className="mt-1 h-1 w-1 rounded-full bg-muted-foreground/40 shrink-0" />
              {a}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Scoring helpers ───────────────────────────────────────────────────────────

function scoreRange(
  value: number,
  greenMin: number,
  greenMax: number,
  amberMin: number,
  amberMax: number,
): { score: number; rating: Rating } {
  if (value >= greenMin && value <= greenMax)
    return { score: 80 + Math.round(((value - greenMin) / (greenMax - greenMin || 1)) * 20), rating: "green" };
  if (value >= amberMin && value <= amberMax)
    return { score: 40 + Math.round(((value - amberMin) / (amberMax - amberMin || 1)) * 40), rating: "amber" };
  return { score: Math.max(0, Math.round(value * 2)), rating: "red" };
}

// ── Main component ────────────────────────────────────────────────────────────

export function RiskScorecard() {
  const { tradeHistory, positions, portfolioValue, pendingOrders, cash } =
    useTradingStore((s) => ({
      tradeHistory: s.tradeHistory,
      positions: s.positions,
      portfolioValue: s.portfolioValue,
      pendingOrders: s.pendingOrders,
      cash: s.cash,
    }));

  const scorecard = useMemo(() => {
    const closedTrades = tradeHistory.filter(
      (t) => t.side === "sell" && typeof t.realizedPnL === "number",
    );

    // ── Factor 1: Diversification ─────────────────────────────────────────────
    const posCount = positions.filter((p) => p.ticker !== "CASH").length;
    const totalPosValue = positions.reduce(
      (s, p) => s + p.quantity * p.currentPrice,
      0,
    );
    const hhi =
      totalPosValue > 0
        ? positions.reduce(
            (sum, p) => {
              const w = (p.quantity * p.currentPrice) / portfolioValue;
              return sum + w * w;
            },
            0,
          )
        : 0;

    let divScore: number;
    let divRating: Rating;
    if (posCount === 0) {
      divScore = 50; // cash is neutral
      divRating = "amber";
    } else if (hhi < 0.15 && posCount >= 4) {
      divScore = 85;
      divRating = "green";
    } else if (hhi < 0.25 && posCount >= 2) {
      divScore = 60;
      divRating = "amber";
    } else {
      divScore = Math.max(10, Math.round((1 - hhi) * 60));
      divRating = "red";
    }

    const divActions: string[] = [];
    if (hhi > 0.25) divActions.push("Spread capital across more tickers to lower HHI below 0.25.");
    if (posCount < 3 && posCount > 0) divActions.push("Open at least 3 uncorrelated positions.");

    const diversificationFactor: Factor = {
      name: "Diversification",
      score: divScore,
      rating: divRating,
      description: `${posCount} position${posCount !== 1 ? "s" : ""}, HHI ${hhi.toFixed(3)} (lower is better).`,
      actions: divActions,
    };

    // ── Factor 2: Position Sizing ─────────────────────────────────────────────
    let sizingScore: number;
    let sizingRating: Rating;
    const sizingActions: string[] = [];

    if (closedTrades.length < 3) {
      sizingScore = 50;
      sizingRating = "amber";
    } else {
      const largestLoss = Math.abs(
        Math.min(...closedTrades.map((t) => t.realizedPnL), 0),
      );
      const lossPct = portfolioValue > 0 ? (largestLoss / portfolioValue) * 100 : 0;
      if (lossPct <= 2) { sizingScore = 90; sizingRating = "green"; }
      else if (lossPct <= 5) { sizingScore = 65; sizingRating = "amber"; }
      else { sizingScore = Math.max(10, Math.round(100 - lossPct * 5)); sizingRating = "red"; }

      if (lossPct > 5)
        sizingActions.push(`Largest single-trade loss was ${lossPct.toFixed(1)}% of portfolio. Risk no more than 2% per trade.`);
      if (lossPct > 2 && lossPct <= 5)
        sizingActions.push("Aim to limit single-trade loss to 1-2% of portfolio value.");
    }

    const positionSizingFactor: Factor = {
      name: "Position Sizing",
      score: sizingScore,
      rating: sizingRating,
      description:
        closedTrades.length < 3
          ? "Not enough trades to evaluate. Need at least 3 closed trades."
          : `Worst single-trade loss vs. portfolio value.`,
      actions: sizingActions,
    };

    // ── Factor 3: Stop-Loss Usage ─────────────────────────────────────────────
    const stopOrders = pendingOrders.filter((o) => o.type === "stop_loss");
    const posWithStop = positions.filter((p) =>
      stopOrders.some((o) => o.ticker === p.ticker),
    ).length;
    const stopCoverage =
      positions.length > 0 ? posWithStop / positions.length : 1;

    let stopScore: number;
    let stopRating: Rating;
    const stopActions: string[] = [];

    if (positions.length === 0) {
      stopScore = 70;
      stopRating = "amber";
    } else if (stopCoverage === 1) {
      stopScore = 95;
      stopRating = "green";
    } else if (stopCoverage >= 0.5) {
      stopScore = Math.round(40 + stopCoverage * 40);
      stopRating = "amber";
      stopActions.push(`${positions.length - posWithStop} position(s) without a stop loss. Add stops to protect downside.`);
    } else {
      stopScore = Math.round(stopCoverage * 40);
      stopRating = "red";
      stopActions.push("Most positions lack stop losses. Set stop losses immediately to cap potential losses.");
    }

    const stopLossFactor: Factor = {
      name: "Stop-Loss Usage",
      score: stopScore,
      rating: stopRating,
      description:
        positions.length === 0
          ? "No open positions."
          : `${posWithStop} of ${positions.length} position(s) have stop losses.`,
      actions: stopActions,
    };

    // ── Factor 4: Win Rate ────────────────────────────────────────────────────
    let winRateScore: number;
    let winRateRating: Rating;
    const winRateActions: string[] = [];

    if (closedTrades.length < 5) {
      winRateScore = 50;
      winRateRating = "amber";
    } else {
      const wins = closedTrades.filter((t) => t.realizedPnL > 0).length;
      const wr = wins / closedTrades.length;
      if (wr >= 0.55) { winRateScore = 80 + Math.round((wr - 0.55) * 200); winRateRating = "green"; }
      else if (wr >= 0.4) { winRateScore = 40 + Math.round((wr - 0.4) * 267); winRateRating = "amber"; }
      else { winRateScore = Math.round(wr * 100); winRateRating = "red"; }
      winRateScore = Math.min(100, winRateScore);

      const avgWin = wins > 0 ? closedTrades.filter(t => t.realizedPnL > 0).reduce((s, t) => s + t.realizedPnL, 0) / wins : 0;
      const losses = closedTrades.filter(t => t.realizedPnL <= 0);
      const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.realizedPnL, 0) / losses.length) : 1;
      const rr = avgLoss > 0 ? avgWin / avgLoss : 0;

      if (wr < 0.5) winRateActions.push(`Win rate is ${(wr * 100).toFixed(0)}%. Focus on higher-probability setups.`);
      if (rr < 1.5) winRateActions.push(`Avg win/loss ratio is ${rr.toFixed(2)}. Aim for at least 1.5:1 to be consistently profitable even with a lower win rate.`);
    }

    const winCount = closedTrades.filter((t) => t.realizedPnL > 0).length;
    const wr = closedTrades.length > 0 ? winCount / closedTrades.length : 0;

    const winRateFactor: Factor = {
      name: "Win Rate",
      score: winRateScore,
      rating: winRateRating,
      description:
        closedTrades.length < 5
          ? "Need at least 5 closed trades."
          : `${winCount} wins out of ${closedTrades.length} trades (${(wr * 100).toFixed(0)}%).`,
      actions: winRateActions,
    };

    // ── Factor 5: Drawdown Control ────────────────────────────────────────────
    const sellTrades = [...tradeHistory]
      .filter((t) => t.side === "sell")
      .reverse();

    let maxDd = 0;
    if (sellTrades.length > 0) {
      let runningValue = INITIAL_CAPITAL;
      let peak = INITIAL_CAPITAL;
      for (const t of sellTrades) {
        runningValue += t.realizedPnL;
        if (runningValue > peak) peak = runningValue;
        const dd = peak > 0 ? (peak - runningValue) / peak : 0;
        if (dd > maxDd) maxDd = dd;
      }
    }

    const maxDdPct = maxDd * 100;
    let ddScore: number;
    let ddRating: Rating;
    const ddActions: string[] = [];

    if (sellTrades.length === 0) {
      ddScore = 70;
      ddRating = "amber";
    } else if (maxDdPct <= 5) {
      ddScore = 90;
      ddRating = "green";
    } else if (maxDdPct <= 15) {
      ddScore = Math.round(90 - (maxDdPct - 5) * 4);
      ddRating = "amber";
    } else {
      ddScore = Math.max(5, Math.round(90 - maxDdPct * 3));
      ddRating = "red";
    }

    if (maxDdPct > 15)
      ddActions.push(`Max drawdown of ${maxDdPct.toFixed(1)}% is high. Add stop losses and reduce position sizes to control drawdowns.`);
    else if (maxDdPct > 5)
      ddActions.push("Consider trailing stops to reduce drawdown depth on winners.");

    const drawdownFactor: Factor = {
      name: "Drawdown Control",
      score: ddScore,
      rating: ddRating,
      description:
        sellTrades.length === 0
          ? "No closed trades yet."
          : `Max historical drawdown: ${maxDdPct.toFixed(1)}%.`,
      actions: ddActions,
    };

    // ── Overall score (weighted average) ──────────────────────────────────────
    const WEIGHTS = [0.2, 0.2, 0.25, 0.2, 0.15];
    const factors: Factor[] = [
      diversificationFactor,
      positionSizingFactor,
      stopLossFactor,
      winRateFactor,
      drawdownFactor,
    ];
    const overall = Math.round(
      factors.reduce((sum, f, i) => sum + f.score * WEIGHTS[i], 0),
    );

    const overallRating: Rating =
      overall >= 70 ? "green" : overall >= 40 ? "amber" : "red";

    const overallLabel =
      overall >= 70
        ? "Low Risk"
        : overall >= 55
        ? "Moderate Risk"
        : overall >= 40
        ? "Elevated Risk"
        : "High Risk";

    return { factors, overall, overallRating, overallLabel };
  }, [tradeHistory, positions, portfolioValue, pendingOrders, cash]);

  const labelClass =
    scorecard.overallRating === "green"
      ? "text-green-500"
      : scorecard.overallRating === "amber"
      ? "text-amber-500"
      : "text-destructive";

  return (
    <div className="rounded-lg border border-border/50 bg-card p-5 space-y-5">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">
          Risk Scorecard
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          5-factor risk assessment with weighted overall score.
        </p>
      </div>

      {/* Overall score */}
      <div className="flex items-center gap-6 border border-border/40 rounded-lg p-4 bg-muted/10">
        <ScoreGauge score={scorecard.overall} />
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Overall Risk Score</p>
          <p className={cn("text-xl font-bold", labelClass)}>
            {scorecard.overallLabel}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Weighted across 5 risk factors. Higher is safer.
          </p>
          <div className="flex gap-3 text-[10px] text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-green-500 inline-block" /> 70+ Low
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-amber-500 inline-block" /> 40-69 Elevated
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-destructive inline-block" /> &lt;40 High
            </span>
          </div>
        </div>
      </div>

      {/* Factor breakdown */}
      <div className="space-y-4 divide-y divide-border/30">
        {scorecard.factors.map((f, i) => (
          <div key={i} className={i > 0 ? "pt-4" : ""}>
            <FactorRow factor={f} />
          </div>
        ))}
      </div>

      {/* Weights note */}
      <p className="text-[10px] text-muted-foreground/60 font-mono">
        Weights: Diversification 20% | Sizing 20% | Stop-Loss 25% | Win Rate 20% | Drawdown 15%
      </p>
    </div>
  );
}
