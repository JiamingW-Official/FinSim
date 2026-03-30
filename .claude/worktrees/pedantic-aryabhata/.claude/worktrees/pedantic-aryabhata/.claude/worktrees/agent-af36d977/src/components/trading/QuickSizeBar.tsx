"use client";

import { cn } from "@/lib/utils";

const PCT_OPTIONS = [
  { label: "1%", pct: 0.01 },
  { label: "2%", pct: 0.02 },
  { label: "5%", pct: 0.05 },
  { label: "10%", pct: 0.10 },
  { label: "25%", pct: 0.25 },
];

interface QuickSizeBarProps {
  /** Current portfolio value (cash + positions) in dollars. */
  portfolioValue: number;
  /** Current price of the instrument. */
  currentPrice: number;
  /** Called with the computed whole-share count. */
  onSelectShares: (shares: number) => void;
  /** Currently-active share count so a button can appear "selected". Optional. */
  currentShares?: number;
  className?: string;
}

/**
 * QuickSizeBar — compact row of portfolio-percentage position-size buttons.
 *
 * Each button computes:
 *   shares = floor(portfolioValue × pct / currentPrice)
 * and fires onSelectShares with the result.
 *
 * Renders nothing when currentPrice ≤ 0 to avoid divide-by-zero.
 */
export function QuickSizeBar({
  portfolioValue,
  currentPrice,
  onSelectShares,
  currentShares,
  className,
}: QuickSizeBarProps) {
  if (currentPrice <= 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 border-t border-border bg-card/80 px-3 py-1.5",
        className,
      )}
    >
      <span className="mr-1.5 shrink-0 text-[10px] text-muted-foreground/70">
        Size
      </span>
      {PCT_OPTIONS.map(({ label, pct }) => {
        const shares = Math.max(1, Math.floor((portfolioValue * pct) / currentPrice));
        const isActive = currentShares === shares;
        return (
          <button
            key={label}
            type="button"
            title={`${shares} shares (${label} of portfolio)`}
            onClick={() => onSelectShares(shares)}
            className={cn(
              "flex-1 rounded py-1 text-[10px] font-medium transition-all duration-150",
              isActive
                ? "bg-primary text-white"
                : "border border-border/40 bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
