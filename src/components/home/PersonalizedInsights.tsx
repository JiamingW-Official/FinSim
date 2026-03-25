"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/stores/game-store";
import { useLearnStore } from "@/stores/learn-store";
import { useTradingStore } from "@/stores/trading-store";
import { analyzeUserProfile, type NextAction } from "@/services/ai/personalization";

const ACTION_ICONS: Record<NextAction["type"], React.ElementType> = {
  lesson: BookOpen,
  trade: BarChart3,
  challenge: Target,
  prediction: TrendingUp,
  review: AlertCircle,
};

export function PersonalizedInsights() {
  const stats = useGameStore((s) => s.stats);
  const level = useGameStore((s) => s.level);
  const completedLessons = useLearnStore((s) => s.completedLessons);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  const profile = useMemo(
    () => analyzeUserProfile(stats, completedLessons, level),
    [stats, completedLessons, level],
  );

  return (
    <div className="space-y-3">
      {/* Personalized tip */}
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {profile.personalizedTip}
        </p>
      </div>

      {/* Strengths & Weaknesses (only if user has activity) */}
      {(profile.strengths.length > 0 || profile.weaknesses.length > 0) && (
        <div className="grid grid-cols-2 gap-2">
          {profile.strengths.slice(0, 2).map((s) => (
            <div key={s} className="flex items-start gap-1.5 rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-2.5 py-2">
              <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
              <span className="text-[10px] text-emerald-400/80">{s}</span>
            </div>
          ))}
          {profile.weaknesses.slice(0, 2).map((w) => (
            <div key={w} className="flex items-start gap-1.5 rounded-lg border border-amber-500/10 bg-amber-500/5 px-2.5 py-2">
              <AlertCircle className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
              <span className="text-[10px] text-amber-400/80">{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recommended next actions */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground mb-2">
          Recommended
        </h3>
        <div className="space-y-1.5">
          {profile.nextActions.map((action) => {
            const Icon = ACTION_ICONS[action.type];
            return (
              <Link key={action.title} href={action.href}>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5 transition-colors hover:bg-accent/30">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/8">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{action.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
