"use client";

import { motion } from "framer-motion";
import { useOptionsStore } from "@/stores/options-store";
import { STRATEGY_PRESETS } from "@/data/options/strategy-presets";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Shield,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ArrowUpDown,
  Expand,
  Target,
  Calendar,
  Crosshair,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  TrendingUp,
  TrendingDown,
  Shield,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ArrowUpDown,
  Expand,
  Target,
  Calendar,
  Crosshair,
};

const SENTIMENT_COLORS = {
  bullish: { text: "text-emerald-400", bg: "bg-emerald-500/5" },
  bearish: { text: "text-red-400", bg: "bg-red-500/5" },
  neutral: { text: "text-muted-foreground", bg: "bg-muted-foreground/10" },
  volatile: { text: "text-orange-400", bg: "bg-orange-500/10" },
};

export function StrategyBuilder() {
  const applyPreset = useOptionsStore((s) => s.applyPreset);
  const chainData = useOptionsStore((s) => s.chainData);
  const selectedExpiry = useOptionsStore((s) => s.selectedExpiry);
  const activeStrategy = useOptionsStore((s) => s.activeStrategy);

  const currentChain = chainData.find((c) => c.expiry === selectedExpiry);
  const spotPrice =
    currentChain && currentChain.calls.length > 0
      ? currentChain.calls.reduce(
          (best, c) => (c.inTheMoney ? Math.max(best, c.strike) : best),
          currentChain.calls[0].strike,
        )
      : 0;

  const handleApply = (preset: (typeof STRATEGY_PRESETS)[0]) => {
    if (!currentChain) return;
    // Estimate spot from ATM
    const strikes = currentChain.calls.map((c) => c.strike);
    const midStrike = strikes[Math.floor(strikes.length / 2)];
    applyPreset(preset, midStrike, currentChain);
  };

  return (
    <div className="p-2">
      <div className="mb-2 text-xs font-semibold text-muted-foreground px-1">
        Strategy Presets
      </div>
      <div className="space-y-1">
        {STRATEGY_PRESETS.map((preset) => {
          const Icon = ICON_MAP[preset.icon] ?? Target;
          const colors = SENTIMENT_COLORS[preset.sentiment];
          const isActive = activeStrategy === preset.name;

          return (
            <motion.button
              key={preset.id}
              onClick={() => handleApply(preset)}
              disabled={!currentChain}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors",
                isActive
                  ? "border-orange-400/40 bg-orange-500/10"
                  : "border-border/20 bg-card/30 hover:bg-muted/20",
                !currentChain && "cursor-not-allowed opacity-40",
              )}
              whileHover={currentChain ? { scale: 1.01 } : {}}
              whileTap={currentChain ? { scale: 0.99 } : {}}
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                  colors.bg,
                )}
              >
                <Icon className={cn("h-3 w-3", colors.text)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold leading-tight">
                  {preset.name}
                </div>
                <div className="text-[11px] text-muted-foreground leading-tight truncate">
                  {preset.description}
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded px-1 py-0.5 text-[7px] font-semibold",
                  colors.bg,
                  colors.text,
                )}
              >
                {preset.sentiment}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
