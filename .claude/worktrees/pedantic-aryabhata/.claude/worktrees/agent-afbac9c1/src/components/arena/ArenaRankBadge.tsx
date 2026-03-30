"use client";

import { cn } from "@/lib/utils";
import { ARENA_RANKS, type ArenaRank } from "@/types/arena";

// ── SVG rank icons (no emojis) ─────────────────────────────────

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 1L2 3.5v4.25C2 11.1 4.6 13.9 8 15c3.4-1.1 6-3.9 6-7.25V3.5L8 1z" />
    </svg>
  );
}

function DiamondIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 1L2 6l6 9 6-9-6-5z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 1l1.8 3.6L14 5.4l-3 2.9.7 4.1L8 10.4l-3.7 2 .7-4.1L2 5.4l4.2-.8L8 1z" />
    </svg>
  );
}

function RankIcon({
  iconType,
  className,
}: {
  iconType: "shield" | "diamond" | "star";
  className?: string;
}) {
  if (iconType === "diamond") return <DiamondIcon className={className} />;
  if (iconType === "star") return <StarIcon className={className} />;
  return <ShieldIcon className={className} />;
}

// ── Component ──────────────────────────────────────────────────

interface ArenaRankBadgeProps {
  rank: ArenaRank;
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
}

const ICON_SIZES: Record<string, string> = {
  xs: "h-2.5 w-2.5",
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

const BADGE_SIZES: Record<string, string> = {
  xs: "text-[10px] px-1 py-0 gap-0.5",
  sm: "text-xs px-1.5 py-0.5 gap-1",
  md: "text-sm px-2.5 py-1 gap-1.5",
  lg: "text-base px-3 py-1.5 gap-2",
};

export function ArenaRankBadge({
  rank,
  size = "md",
  showLabel = true,
}: ArenaRankBadgeProps) {
  const info = ARENA_RANKS[rank];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border font-bold",
        info.bgColor,
        info.borderColor,
        info.color,
        BADGE_SIZES[size],
      )}
    >
      <RankIcon iconType={info.iconType} className={ICON_SIZES[size]} />
      {showLabel && <span>{info.label}</span>}
    </span>
  );
}

/** Standalone large rank display card used in lobby/results screens */
export function RankBadge({
  rank,
  elo,
  showElo = true,
}: {
  rank: ArenaRank;
  elo?: number;
  showElo?: boolean;
}) {
  const info = ARENA_RANKS[rank];

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border px-4 py-3",
        info.bgColor,
        info.borderColor,
      )}
    >
      <RankIcon
        iconType={info.iconType}
        className={cn("h-8 w-8", info.color)}
      />
      <span className={cn("text-sm font-black", info.color)}>{info.label}</span>
      {showElo && elo !== undefined && (
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {elo} ELO
        </span>
      )}
    </div>
  );
}
