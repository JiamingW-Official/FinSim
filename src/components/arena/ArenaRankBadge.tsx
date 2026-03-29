"use client";

import { cn } from "@/lib/utils";
import { ARENA_RANKS, type ArenaRank } from "@/types/arena";

interface ArenaRankBadgeProps {
  rank: ArenaRank;
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function ArenaRankBadge({ rank, size = "md", showLabel = true }: ArenaRankBadgeProps) {
  const info = ARENA_RANKS[rank];
  const sizes = {
    xs: "text-xs px-1 py-0 gap-0.5",
    sm: "text-xs px-1.5 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border font-semibold",
        info.bgColor,
        info.borderColor,
        info.color,
        sizes[size],
      )}
    >
      <span>{info.emoji}</span>
      {showLabel && <span>{info.label}</span>}
    </span>
  );
}
