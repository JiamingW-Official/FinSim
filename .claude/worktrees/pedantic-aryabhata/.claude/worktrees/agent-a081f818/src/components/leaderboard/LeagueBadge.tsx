"use client";

import { cn } from "@/lib/utils";
import { LEAGUES } from "@/types/leaderboard";
import type { LeagueTier } from "@/types/leaderboard";

interface LeagueBadgeProps {
  tier: LeagueTier;
  size?: "sm" | "lg";
  className?: string;
}

export function LeagueBadge({ tier, size = "sm", className }: LeagueBadgeProps) {
  const league = LEAGUES[tier];

  if (size === "lg") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5",
          league.borderColor,
          league.bgColor,
          league.badgeClass,
          className,
        )}
      >
        <span className="text-sm">{league.emoji}</span>
        <span className={cn("text-xs font-black", league.color)}>
          {league.label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5",
        league.borderColor,
        league.bgColor,
        league.badgeClass,
        className,
      )}
    >
      <span className="text-[10px]">{league.emoji}</span>
      <span className={cn("text-[9px] font-bold", league.color)}>
        {league.label}
      </span>
    </div>
  );
}
