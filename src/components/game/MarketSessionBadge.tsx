"use client";

import { cn } from "@/lib/utils";

export type MarketSession = "pre-market" | "open" | "after-hours" | "closed";

interface MarketSessionBadgeProps {
  session: MarketSession;
  className?: string;
}

const SESSION_CONFIG: Record<
  MarketSession,
  { label: string; dotColor: string; textColor: string; bgColor: string; pulse: boolean }
> = {
  "pre-market": {
    label: "PRE",
    dotColor: "bg-amber-400",
    textColor: "text-amber-400/90",
    bgColor: "bg-amber-400/10",
    pulse: false,
  },
  open: {
    label: "OPEN",
    dotColor: "bg-emerald-400",
    textColor: "text-emerald-400/90",
    bgColor: "bg-emerald-400/10",
    pulse: true,
  },
  "after-hours": {
    label: "AH",
    dotColor: "bg-blue-400",
    textColor: "text-blue-400/90",
    bgColor: "bg-blue-400/10",
    pulse: false,
  },
  closed: {
    label: "CLOSED",
    dotColor: "bg-muted-foreground/40",
    textColor: "text-muted-foreground/60",
    bgColor: "bg-muted-foreground/5",
    pulse: false,
  },
};

export function MarketSessionBadge({
  session,
  className,
}: MarketSessionBadgeProps) {
  const cfg = SESSION_CONFIG[session];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5",
        "font-mono text-[9px] uppercase tracking-widest",
        cfg.textColor,
        cfg.bgColor,
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className={cn("absolute inset-0 rounded-full", cfg.dotColor)}
        />
        {cfg.pulse && (
          <span
            className={cn(
              "absolute inset-0 rounded-full animate-ping",
              cfg.dotColor,
              "opacity-75",
            )}
          />
        )}
      </span>
      {cfg.label}
    </span>
  );
}
