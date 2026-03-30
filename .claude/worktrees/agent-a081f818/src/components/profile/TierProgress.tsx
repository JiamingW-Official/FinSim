"use client";

import { useMemo } from "react";
import {
  Plane,
  Navigation,
  Compass,
  Radio,
  Crosshair,
  Check,
  Lock,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/stores/game-store";
import {
  TIER_DEFINITIONS,
  computeTierProgress,
} from "@/data/tier-requirements";
import type { TierDefinition } from "@/types/tiers";

// ─── Icon map ────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Plane,
  Navigation,
  Compass,
  Radio,
  Crosshair,
};

function TierIcon({
  iconName,
  className,
}: {
  iconName: string;
  className?: string;
}) {
  const Icon = ICON_MAP[iconName] ?? Plane;
  return <Icon className={className} />;
}

// ─── Tier color helpers ───────────────────────────────────────────────────────
const TIER_COLORS: Record<
  string,
  { border: string; text: string; bg: string; bar: string }
> = {
  "slate-400": {
    border: "border-slate-400",
    text: "text-slate-400",
    bg: "bg-slate-400/10",
    bar: "bg-slate-400",
  },
  "sky-400": {
    border: "border-sky-400",
    text: "text-sky-400",
    bg: "bg-sky-400/10",
    bar: "bg-sky-400",
  },
  "blue-400": {
    border: "border-blue-400",
    text: "text-blue-400",
    bg: "bg-blue-400/10",
    bar: "bg-blue-400",
  },
  "indigo-400": {
    border: "border-indigo-400",
    text: "text-indigo-400",
    bg: "bg-indigo-400/10",
    bar: "bg-indigo-400",
  },
  "amber-400": {
    border: "border-amber-400",
    text: "text-amber-400",
    bg: "bg-amber-400/10",
    bar: "bg-amber-400",
  },
};

function tierColors(color: string) {
  return (
    TIER_COLORS[color] ?? {
      border: "border-primary",
      text: "text-primary",
      bg: "bg-primary/10",
      bar: "bg-primary",
    }
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RequirementItem({
  label,
  met,
}: {
  label: string;
  met: boolean;
}) {
  return (
    <li className="flex items-start gap-1.5 text-xs">
      {met ? (
        <Check className="mt-0.5 h-3 w-3 shrink-0 text-green-400" />
      ) : (
        <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
      )}
      <span className={cn(met ? "text-muted-foreground line-through" : "text-foreground")}>
        {label}
      </span>
    </li>
  );
}

function FeatureItem({
  label,
  unlocked,
}: {
  label: string;
  unlocked: boolean;
}) {
  return (
    <li className="flex items-center gap-1.5 text-xs">
      {unlocked ? (
        <Check className="h-3 w-3 shrink-0 text-green-400" />
      ) : (
        <Lock className="h-3 w-3 shrink-0 text-muted-foreground/50" />
      )}
      <span
        className={cn(
          unlocked ? "text-foreground" : "text-muted-foreground/60",
        )}
      >
        {label}
      </span>
    </li>
  );
}

// ─── Single tier row ──────────────────────────────────────────────────────────
interface TierRowProps {
  tier: TierDefinition;
  isCurrent: boolean;
  isCompleted: boolean;
  progress: number; // 0–100, only relevant when isCurrent
  playerStats: {
    totalTrades: number;
    sharpeRatio: number;
    behaviorScore: number;
    completedLessons: number;
  };
}

function TierRow({
  tier,
  isCurrent,
  isCompleted,
  progress,
  playerStats,
}: TierRowProps) {
  const colors = tierColors(tier.color);
  const req = tier.requirements;

  const reqItems = useMemo(() => {
    const items: { label: string; met: boolean }[] = [];

    if (req.tradesCompleted > 0) {
      items.push({
        label: `${req.tradesCompleted} trades completed`,
        met: playerStats.totalTrades >= req.tradesCompleted,
      });
    }
    if (req.minSharpe !== null) {
      items.push({
        label: `Sharpe ratio ≥ ${req.minSharpe.toFixed(1)}`,
        met: playerStats.sharpeRatio >= req.minSharpe,
      });
    }
    if (req.behaviorScore !== null) {
      items.push({
        label: `Behavioral score ≥ ${req.behaviorScore}`,
        met: playerStats.behaviorScore >= req.behaviorScore,
      });
    }
    if (req.completedLessons > 0) {
      items.push({
        label: `${req.completedLessons} lessons completed`,
        met: playerStats.completedLessons >= req.completedLessons,
      });
    }
    if (req.additionalNotes) {
      items.push({
        label: req.additionalNotes,
        met: isCompleted || isCurrent,
      });
    }
    return items;
  }, [req, playerStats, isCompleted, isCurrent]);

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-3 transition-all",
        isCurrent
          ? cn("border-2", colors.border, colors.bg)
          : isCompleted
            ? "border-border opacity-70"
            : "border-border opacity-50",
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-2">
        {/* Icon badge */}
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
            isCurrent || isCompleted ? colors.border : "border-border",
            isCurrent || isCompleted ? colors.bg : "bg-muted/20",
          )}
        >
          <TierIcon
            iconName={tier.icon}
            className={cn(
              "h-4 w-4",
              isCurrent || isCompleted ? colors.text : "text-muted-foreground",
            )}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-semibold",
                isCurrent || isCompleted ? colors.text : "text-muted-foreground",
              )}
            >
              {tier.name}
            </span>
            {isCompleted && (
              <span className="rounded-full bg-green-500/15 px-1.5 py-0.5 text-[10px] font-medium text-green-400">
                Achieved
              </span>
            )}
            {isCurrent && !isCompleted && (
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                Current
              </span>
            )}
          </div>
          <p className="truncate text-[10px] text-muted-foreground">
            {tier.description}
          </p>
        </div>
      </div>

      {/* Progress bar (only on current tier) */}
      {isCurrent && (
        <div className="mt-2.5">
          <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Progress to next tier</span>
            <span className="tabular-nums font-medium">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
            <div
              className={cn("h-full rounded-full transition-all", colors.bar)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Unlocked features */}
      {(isCurrent || isCompleted) && (
        <div className="mt-2.5">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Unlocked
          </p>
          <ul className="space-y-0.5">
            {tier.unlockedFeatures.map((f) => (
              <FeatureItem key={f} label={f} unlocked={true} />
            ))}
          </ul>
        </div>
      )}

      {/* Requirements checklist (only for next tier) */}
      {!isCurrent && !isCompleted && reqItems.length > 0 && (
        <div className="mt-2.5">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Requirements
          </p>
          <ul className="space-y-0.5">
            {reqItems.map((item) => (
              <RequirementItem
                key={item.label}
                label={item.label}
                met={item.met}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Locked features */}
      {!isCurrent && !isCompleted && (
        <div className="mt-2">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Locked
          </p>
          <ul className="space-y-0.5">
            {tier.unlockedFeatures.slice(0, 3).map((f) => (
              <FeatureItem key={f} label={f} unlocked={false} />
            ))}
            {tier.unlockedFeatures.length > 3 && (
              <li className="text-[10px] text-muted-foreground/50">
                +{tier.unlockedFeatures.length - 3} more
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Tips for leveling up ─────────────────────────────────────────────────────
const LEVEL_UP_TIPS: Record<string, string[]> = {
  "First Officer": [
    "Execute at least 20 trades to build a track record.",
    "Practice with vertical spreads in the strategy builder.",
    "Complete the Spreads module in Learn.",
    "Pass the spreads knowledge quiz with 80%+.",
  ],
  Captain: [
    "Build your trade history to 50 executions.",
    "Focus on risk-adjusted returns — aim for Sharpe > 0.5.",
    "Study straddles and condors in advanced lessons.",
    "Review volatility smile charts regularly.",
  ],
  Commander: [
    "Reach 100 total trades with consistent discipline.",
    "Maintain a Sharpe ratio above 1.0 across all trades.",
    "Stay profitable over any run of 50 consecutive trades.",
    "Complete 20 structured lessons.",
  ],
  Alpha: [
    "Maintain a behavioral discipline score above 70.",
    "Avoid anchoring, overconfidence, and disposition-effect traps.",
    "Complete 30 lessons including options theory.",
    "Sustain strong risk-adjusted performance over time.",
  ],
};

// ─── Main component ───────────────────────────────────────────────────────────
export function TierProgress() {
  const stats = useGameStore((s) => s.stats);

  // Synthesize stats for tier computation
  // Sharpe and behaviorScore are placeholders until dedicated stores are added
  const playerStats = useMemo(
    () => ({
      totalTrades: stats.totalTrades,
      sharpeRatio: 0, // placeholder — will be wired to quant store
      behaviorScore: 0, // placeholder — will be wired to behavioral profile
      completedLessons: 0, // placeholder — will be wired to learn store
      tutorialComplete: stats.totalTrades > 0,
    }),
    [stats],
  );

  const { currentTier, nextTier, progress } = useMemo(
    () => computeTierProgress(playerStats),
    [playerStats],
  );

  const tips = nextTier ? LEVEL_UP_TIPS[nextTier.name] ?? [] : [];

  return (
    <div className="space-y-3">
      {/* Stepper */}
      <div className="space-y-2">
        {TIER_DEFINITIONS.map((tier) => {
          const isCurrent = tier.name === currentTier.name;
          const isCompleted = tier.level < currentTier.level;

          return (
            <TierRow
              key={tier.name}
              tier={tier}
              isCurrent={isCurrent}
              isCompleted={isCompleted}
              progress={isCurrent ? progress : 0}
              playerStats={playerStats}
            />
          );
        })}
      </div>

      {/* How to level up */}
      {nextTier && tips.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <p className="mb-2 text-xs font-semibold text-foreground">
            How to reach {nextTier.name}
          </p>
          <ul className="space-y-1">
            {tips.map((tip) => (
              <li key={tip} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {currentTier.name === "Alpha" && (
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-3 text-center">
          <p className="text-xs font-semibold text-amber-400">
            Maximum tier achieved
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            You have reached Alpha status. All features are unlocked.
          </p>
        </div>
      )}
    </div>
  );
}
