"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Info, Activity, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  computeCounterpartySnapshot,
  defaultEnabledAgents,
  resetAgentHistory,
  type BehaviorType,
  type CounterpartyAgent,
  type AgentAction,
} from "@/services/market/counterparty-agents";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatNotional(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function formatImpactPct(v: number): string {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${(v * 100).toFixed(3)}%`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Initials avatar for each archetype */
function AgentAvatar({ id, active }: { id: BehaviorType; active: boolean }) {
  const initials: Record<BehaviorType, string> = {
    market_maker: "MM",
    momentum_chaser: "MC",
    institutional_arb: "IA",
    retail_herd: "RH",
    black_swan: "BS",
  };
  const colors: Record<BehaviorType, string> = {
    market_maker: "bg-[#2d9cdb]/15 text-[#2d9cdb] border-[#2d9cdb]/30",
    momentum_chaser: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    institutional_arb: "bg-violet-500/15 text-violet-500 border-violet-500/30",
    retail_herd: "bg-green-500/15 text-green-500 border-green-500/30",
    black_swan: "bg-red-500/15 text-red-500 border-red-500/30",
  };
  return (
    <div
      className={cn(
        "w-8 h-8 rounded-md border flex items-center justify-center text-[10px] font-bold shrink-0 transition-opacity",
        colors[id],
        !active && "opacity-40",
      )}
    >
      {initials[id]}
    </div>
  );
}

/** Activity bar (0-1) */
function ActivityBar({ value, id }: { value: number; id: BehaviorType }) {
  const fillColors: Record<BehaviorType, string> = {
    market_maker: "bg-[#2d9cdb]",
    momentum_chaser: "bg-amber-500",
    institutional_arb: "bg-violet-500",
    retail_herd: "bg-green-500",
    black_swan: "bg-red-500",
  };
  return (
    <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-300", fillColors[id])}
        style={{ width: `${Math.min(100, value * 100).toFixed(1)}%` }}
      />
    </div>
  );
}

/** Pressure arrow */
function PressureIndicator({ pressure }: { pressure: number }) {
  const abs = Math.abs(pressure);
  const label =
    abs < 0.1 ? "Neutral" : pressure > 0 ? "Bullish" : "Bearish";
  const color =
    abs < 0.1
      ? "text-muted-foreground"
      : pressure > 0
        ? "text-green-500"
        : "text-red-500";
  return (
    <span className={cn("text-[10px] font-medium tabular-nums", color)}>
      {label} ({pressure >= 0 ? "+" : ""}{(pressure * 100).toFixed(0)}%)
    </span>
  );
}

/** Recent action row */
function ActionRow({ action }: { action: AgentAction }) {
  const sentimentDot: Record<AgentAction["sentiment"], string> = {
    bullish: "bg-green-500",
    bearish: "bg-red-500",
    neutral: "bg-muted-foreground",
    disruptive: "bg-red-600",
  };
  return (
    <div className="flex gap-2 items-start py-1.5 border-b border-border/40 last:border-0">
      <span
        className={cn(
          "mt-1.5 w-1.5 h-1.5 rounded-full shrink-0",
          sentimentDot[action.sentiment],
        )}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-foreground/80 leading-snug">
          {action.description}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground">
            {formatTime(action.timestamp)}
          </span>
          {action.notional > 0 && (
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {formatNotional(action.notional)}
            </span>
          )}
          {action.priceImpactPct !== 0 && (
            <span
              className={cn(
                "text-[10px] tabular-nums font-medium",
                action.priceImpactPct > 0 ? "text-green-500" : "text-red-500",
              )}
            >
              {formatImpactPct(action.priceImpactPct)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Single agent card */
function AgentCard({
  agent,
  expanded,
  onToggle,
  onEnable,
}: {
  agent: CounterpartyAgent;
  expanded: boolean;
  onToggle: () => void;
  onEnable: (id: BehaviorType, enabled: boolean) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-md border bg-card transition-colors",
        agent.enabled ? "border-border" : "border-border/40 opacity-60",
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 p-2.5">
        <AgentAvatar id={agent.id} active={agent.enabled} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold truncate">{agent.name}</span>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <Info className="w-3 h-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="max-w-xs text-xs space-y-1.5"
                >
                  <p className="font-semibold">{agent.name}</p>
                  <p className="text-muted-foreground">{agent.description}</p>
                  <p className="border-t border-border/60 pt-1.5 text-muted-foreground">
                    <span className="font-medium text-foreground">Real-world: </span>
                    {agent.realWorldEquivalent}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <ActivityBar value={agent.activityLevel} id={agent.id} />
        </div>

        {/* Enable toggle */}
        <button
          onClick={() => onEnable(agent.id, !agent.enabled)}
          className={cn(
            "w-8 h-4 rounded-full border transition-colors shrink-0",
            agent.enabled
              ? "bg-[#2d9cdb]/20 border-[#2d9cdb]/50"
              : "bg-muted border-border/60",
          )}
          aria-label={agent.enabled ? "Disable agent" : "Enable agent"}
        >
          <span
            className={cn(
              "block w-3 h-3 rounded-full transition-all duration-200",
              agent.enabled
                ? "ml-4 bg-[#2d9cdb]"
                : "ml-0.5 bg-muted-foreground/50",
            )}
          />
        </button>

        {/* Expand toggle */}
        <button
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground transition-colors ml-0.5"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <svg
            className={cn("w-3.5 h-3.5 transition-transform", expanded && "rotate-180")}
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2 4l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Action + pressure row */}
      <div className="px-2.5 pb-2 -mt-1">
        <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
          {agent.currentAction}
        </p>
        <div className="flex items-center justify-between mt-1">
          <PressureIndicator pressure={agent.currentPressure} />
          <span className="text-[10px] text-muted-foreground tabular-nums">
            Spread: {(agent.spreadImpactPct * 10000).toFixed(1)}bps
          </span>
        </div>
      </div>

      {/* Expanded: recent actions */}
      {expanded && agent.recentActions.length > 0 && (
        <div className="border-t border-border/40 px-2.5 py-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">
            Recent Actions
          </p>
          {agent.recentActions.map((action, i) => (
            <ActionRow key={i} action={action} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface CounterpartyPanelProps {
  ticker: string;
  barIndex: number;
  currentPrice: number;
  priceChangePct: number;
  recentVolPct: number;
  hasNews?: boolean;
}

export function CounterpartyPanel({
  ticker,
  barIndex,
  currentPrice,
  priceChangePct,
  recentVolPct,
  hasNews = false,
}: CounterpartyPanelProps) {
  const [enabledAgents, setEnabledAgents] = useState<Set<BehaviorType>>(
    defaultEnabledAgents,
  );
  const [expandedAgent, setExpandedAgent] = useState<BehaviorType | null>(null);
  const [forceBlackSwan, setForceBlackSwan] = useState(false);
  const [swanCooldown, setSwanCooldown] = useState(false);

  const snapshot = useMemo(
    () =>
      computeCounterpartySnapshot({
        ticker,
        barIndex,
        currentPrice,
        priceChangePct,
        recentVolPct,
        hasNews,
        enabledAgents,
        forceBlackSwan,
      }),
    [
      ticker,
      barIndex,
      currentPrice,
      priceChangePct,
      recentVolPct,
      hasNews,
      enabledAgents,
      forceBlackSwan,
    ],
  );

  const handleEnableAgent = useCallback(
    (id: BehaviorType, enabled: boolean) => {
      setEnabledAgents((prev) => {
        const next = new Set(prev);
        if (enabled) next.add(id);
        else next.delete(id);
        return next;
      });
    },
    [],
  );

  const handleSimulateBlackSwan = useCallback(() => {
    if (swanCooldown) return;
    resetAgentHistory();
    setForceBlackSwan(true);
    setSwanCooldown(true);
    setTimeout(() => {
      setForceBlackSwan(false);
      setSwanCooldown(false);
    }, 3000);
  }, [swanCooldown]);

  const handleToggleExpand = useCallback((id: BehaviorType) => {
    setExpandedAgent((prev) => (prev === id ? null : id));
  }, []);

  // Regime color
  const regimeColor = snapshot.blackSwanActive
    ? "text-red-500"
    : snapshot.regimeLabel === "Stressed Liquidity"
      ? "text-amber-500"
      : snapshot.regimeLabel === "Elevated Spreads"
        ? "text-amber-400"
        : snapshot.regimeLabel === "Directional Flow"
          ? "text-[#2d9cdb]"
          : "text-muted-foreground";

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#2d9cdb]" />
          <span className="text-xs font-semibold">Counterparty Agents</span>
        </div>
        <span className={cn("text-[10px] font-medium", regimeColor)}>
          {snapshot.regimeLabel}
        </span>
      </div>

      {/* Aggregate stats bar */}
      <div className="grid grid-cols-2 divide-x divide-border/60 border-b border-border/60 text-[10px]">
        <div className="px-3 py-1.5">
          <span className="text-muted-foreground block">Aggregate Price Impact</span>
          <span
            className={cn(
              "font-semibold tabular-nums",
              snapshot.aggregatePriceImpactPct > 0
                ? "text-green-500"
                : snapshot.aggregatePriceImpactPct < 0
                  ? "text-red-500"
                  : "text-foreground",
            )}
          >
            {formatImpactPct(snapshot.aggregatePriceImpactPct)}
          </span>
        </div>
        <div className="px-3 py-1.5">
          <span className="text-muted-foreground block">Spread Impact</span>
          <span className="font-semibold tabular-nums text-foreground">
            +{(snapshot.aggregateSpreadImpactPct * 10000).toFixed(1)}bps
          </span>
        </div>
      </div>

      {/* Black swan alert banner */}
      {snapshot.blackSwanActive && (
        <div className="mx-3 mt-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-red-500 shrink-0" />
            <span className="text-[11px] font-semibold text-red-500">
              Tail Event Active
            </span>
          </div>
          <p className="text-[10px] text-red-400/80 mt-0.5">
            Black Swan Generator has triggered a market disruption. Spreads and
            price impact are elevated. Monitor risk parameters.
          </p>
        </div>
      )}

      {/* Agent cards */}
      <div className="p-2 space-y-1.5">
        {snapshot.agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            expanded={expandedAgent === agent.id}
            onToggle={() => handleToggleExpand(agent.id)}
            onEnable={handleEnableAgent}
          />
        ))}
      </div>

      {/* Footer: simulate event */}
      <div className="px-3 pb-3 pt-1">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-full h-8 text-xs border-red-500/40 text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors",
            swanCooldown && "opacity-50 cursor-not-allowed",
          )}
          onClick={handleSimulateBlackSwan}
          disabled={swanCooldown}
        >
          <Zap className="w-3 h-3 mr-1.5" />
          {swanCooldown ? "Event in progress..." : "Simulate Tail Event"}
        </Button>
        <p className="text-[10px] text-muted-foreground text-center mt-1.5 leading-snug">
          Triggers Black Swan Generator. 1% natural probability per bar.
        </p>
      </div>
    </div>
  );
}

// ── CounterpartyMatchCard ─────────────────────────────────────────────────────
// Lightweight inline component for OrderEntry "Market Intelligence" section.
// Shows "Matching counterparty..." for 500 ms then reveals the primary archetype.

const MATCH_ARCHETYPE_META: Record<
  BehaviorType,
  { color: string; borderColor: string; bgColor: string; summary: string; intentPrefix: string }
> = {
  market_maker: {
    color: "text-sky-400",
    borderColor: "border-sky-400/40",
    bgColor: "bg-sky-400/5",
    summary: "Market makers fade momentum moves and harvest the spread.",
    intentPrefix: "Taking the other side to",
  },
  momentum_chaser: {
    color: "text-amber-400",
    borderColor: "border-amber-400/40",
    bgColor: "bg-amber-400/5",
    summary: "Momentum chasers amplify existing trends — they join, not oppose.",
    intentPrefix: "Following price action to",
  },
  institutional_arb: {
    color: "text-violet-400",
    borderColor: "border-violet-400/40",
    bgColor: "bg-violet-400/5",
    summary: "Institutional arb desks push price toward fair value with large clips.",
    intentPrefix: "Exploiting mispricing to",
  },
  retail_herd: {
    color: "text-rose-400",
    borderColor: "border-rose-400/40",
    bgColor: "bg-rose-400/5",
    summary: "Retail crowd overreacts to news and holds losers — predictably late.",
    intentPrefix: "Reacting to sentiment to",
  },
  black_swan: {
    color: "text-red-500",
    borderColor: "border-red-500/40",
    bgColor: "bg-red-500/5",
    summary: "Tail-risk events dislocate liquidity and widen spreads severely.",
    intentPrefix: "Injecting systemic shock to",
  },
};

function pickPrimaryCounterparty(
  agents: CounterpartyAgent[],
  side: "buy" | "sell",
): CounterpartyAgent | null {
  const active = agents.filter((a) => a.enabled && a.activityLevel > 0.05);
  if (active.length === 0) return null;
  const userDir = side === "buy" ? 1 : -1;
  const scored = active.map((a) => ({
    agent: a,
    score: a.activityLevel - a.currentPressure * userDir * 0.3,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored[0].agent;
}

function buildMatchIntent(agent: CounterpartyAgent, side: "buy" | "sell"): string {
  const meta = MATCH_ARCHETYPE_META[agent.behaviorType];
  const action = agent.currentAction.toLowerCase().split(/[;,]/)[0].trim().slice(0, 70);
  const sideVerb = side === "buy" ? "sell to you" : "buy from you";
  return `${meta.intentPrefix} ${sideVerb} — ${action}.`;
}

type MatchPhase = "idle" | "matching" | "revealed";

interface CounterpartyMatchCardProps {
  /** The side the user is about to trade */
  side: "buy" | "sell";
  /** Whether a valid order can be executed (qty > 0 && price > 0) */
  orderReady: boolean;
}

export function CounterpartyMatchCard({ side, orderReady }: CounterpartyMatchCardProps) {
  const ticker = useChartStore((s) => s.currentTicker);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);

  const [phase, setPhase] = useState<MatchPhase>("idle");
  const [matchedAgent, setMatchedAgent] = useState<CounterpartyAgent | null>(null);
  const [confidence, setConfidence] = useState(0);

  const snapshotInputs = useMemo(() => {
    if (allData.length === 0 || revealedCount < 2) return null;
    const currentBar = allData[revealedCount - 1];
    const prevBar = allData[revealedCount - 2];
    const priceChangePct =
      prevBar.close > 0 ? (currentBar.close - prevBar.close) / prevBar.close : 0;

    const window = allData.slice(Math.max(0, revealedCount - 10), revealedCount);
    const returns = window.slice(1).map((b, i) =>
      window[i].close > 0 ? (b.close - window[i].close) / window[i].close : 0,
    );
    const mean = returns.reduce((s, r) => s + r, 0) / (returns.length || 1);
    const recentVolPct =
      returns.length > 1
        ? Math.sqrt(returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length)
        : 0.008;

    return {
      ticker,
      barIndex: revealedCount,
      currentPrice: currentBar.close,
      priceChangePct,
      recentVolPct,
      hasNews: false,
      enabledAgents: defaultEnabledAgents(),
      forceBlackSwan: false,
    };
  }, [ticker, allData, revealedCount]);

  useEffect(() => {
    if (!orderReady || !snapshotInputs) {
      setPhase("idle");
      return;
    }
    setPhase("matching");
    const timer = setTimeout(() => {
      const snapshot = computeCounterpartySnapshot(snapshotInputs);
      const picked = pickPrimaryCounterparty(snapshot.agents, side);
      if (picked) {
        setMatchedAgent(picked);
        // Scale activityLevel (0..1) to confidence range 40–90%
        setConfidence(Math.round(40 + picked.activityLevel * 50));
        setPhase("revealed");
      } else {
        setPhase("idle");
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side, orderReady, ticker, revealedCount]);

  if (!orderReady) return null;

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        Market Intelligence
      </div>

      {phase === "matching" && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2.5">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Matching counterparty...</span>
        </div>
      )}

      {phase === "revealed" && matchedAgent && (() => {
        const meta = MATCH_ARCHETYPE_META[matchedAgent.behaviorType];
        const intent = buildMatchIntent(matchedAgent, side);
        const fillClass = meta.color.replace("text-", "bg-");
        return (
          <div
            className={cn(
              "rounded-md border px-3 py-2.5 space-y-2",
              meta.borderColor,
              meta.bgColor,
            )}
          >
            <div className="flex items-center justify-between">
              <span className={cn("text-xs font-semibold", meta.color)}>
                {matchedAgent.name}
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {confidence}% confident
              </span>
            </div>

            <p className="text-[11px] leading-snug text-foreground/80">{intent}</p>

            <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", fillClass)}
                style={{ width: `${confidence}%` }}
              />
            </div>

            <p className="text-[10px] text-muted-foreground leading-snug border-t border-border/40 pt-1.5">
              {meta.summary}
            </p>
          </div>
        );
      })()}
    </div>
  );
}
