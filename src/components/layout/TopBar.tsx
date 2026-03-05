"use client";

import { useChartStore } from "@/stores/chart-store";
import { useTradingStore } from "@/stores/trading-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { WATCHLIST_STOCKS } from "@/types/market";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import { usePriceFlash, useAnimatedNumber } from "@/hooks/usePriceFlash";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Volume2, VolumeX, BookOpen } from "lucide-react";
import { useSettingsStore } from "@/stores/settings-store";
import { useLearnStore } from "@/stores/learn-store";
import { XPBar } from "@/components/game/XPBar";
import { ProgressRing } from "@/components/game/ProgressRing";
import { StreakBadge } from "@/components/game/StreakBadge";
import { useGameStore } from "@/stores/game-store";
import { getXPForNextLevel, LEVEL_THRESHOLDS } from "@/types/game";
import { NotificationCenter } from "./NotificationCenter";
import { HeartsDisplay } from "@/components/learn/HeartsDisplay";
import { usePathname } from "next/navigation";

export function TopBar() {
  const { currentTicker } = useChartStore();
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const isPlaying = useMarketDataStore((s) => s.isPlaying);
  const currentBar =
    allData.length > 0 && revealedCount > 0
      ? allData[revealedCount - 1]
      : null;

  const stockInfo = WATCHLIST_STOCKS.find((s) => s.ticker === currentTicker);
  const price = currentBar?.close ?? 0;
  const priceFlash = usePriceFlash(price || undefined);
  const animatedPrice = useAnimatedNumber(price, 250);
  const animatedPortfolio = useAnimatedNumber(portfolioValue, 350);

  const dayChange =
    currentBar && currentBar.open > 0
      ? ((currentBar.close - currentBar.open) / currentBar.open) * 100
      : 0;

  const priceDisplay = price > 0 ? formatCurrency(animatedPrice) : "---";

  const pathname = usePathname();
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const currentLevelXP = level > 1 ? LEVEL_THRESHOLDS[level - 2] : 0;
  const nextLevelXP = getXPForNextLevel(level);
  const xpPercent = level >= 50 ? 100 : Math.min(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100, 100);

  return (
    <div className="relative glass flex h-10 items-center justify-between px-4 border-b border-border/30 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/20 after:to-transparent">
      <div className="flex items-center gap-4">
        <span className="inline-flex items-center gap-1.5">
          <span className="text-sm font-black tracking-tight text-primary">FS</span>
          <span className="text-sm font-semibold tracking-wide text-foreground/80">FinSim</span>
        </span>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold">{currentTicker}</span>
          <span className="text-muted-foreground">
            {stockInfo?.name ?? ""}
          </span>
          <span
            className={cn(
              "font-bold tabular-nums transition-colors duration-300",
              priceFlash === "up" && "price-flash-up",
              priceFlash === "down" && "price-flash-down",
            )}
          >
            {priceDisplay}
          </span>
          {currentBar && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium",
                dayChange >= 0
                  ? "bg-[#10b981]/10 text-[#10b981]"
                  : "bg-[#ef4444]/10 text-[#ef4444]",
              )}
            >
              {dayChange >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {formatPercent(dayChange)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2" data-tutorial="xp-level">
          <ProgressRing progress={xpPercent} size={28} strokeWidth={2.5}>
            <span className="text-[8px] font-black tabular-nums text-primary">{level}</span>
          </ProgressRing>
          <XPBar />
          <StreakBadge />
          <LearnStreakBadge />
          {pathname?.startsWith("/learn") && <HeartsDisplay compact />}
        </div>
        <NotificationCenter />
        <SoundToggle />
        <div className="h-4 w-px bg-border" />
        {currentBar && (
          <span className="text-muted-foreground">
            {formatDate(currentBar.timestamp)}
          </span>
        )}
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-1.5" data-tutorial="portfolio">
          <span className="text-muted-foreground">Portfolio</span>
          <span className="font-semibold tabular-nums">
            {formatCurrency(animatedPortfolio)}
          </span>
        </div>
        {isPlaying && (
          <div className="flex items-center gap-1">
            <div className="pulse-dot h-2 w-2 rounded-full bg-[#10b981]" />
            <span className="text-xs text-[#10b981]">LIVE</span>
          </div>
        )}
      </div>
    </div>
  );
}

function LearnStreakBadge() {
  const learningStreak = useLearnStore((s) => s.learningStreak);
  if (learningStreak <= 0) return null;

  return (
    <div className="flex items-center gap-0.5 rounded-full bg-violet-500/10 px-1.5 py-0.5">
      <BookOpen className="h-3 w-3 text-violet-400" />
      <span className="text-[10px] font-bold tabular-nums text-violet-400">
        {learningStreak}
      </span>
    </div>
  );
}

function SoundToggle() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const toggleSound = useSettingsStore((s) => s.toggleSound);

  return (
    <button
      type="button"
      onClick={toggleSound}
      className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
      title={soundEnabled ? "Mute sounds" : "Enable sounds"}
    >
      {soundEnabled ? (
        <Volume2 className="h-3.5 w-3.5" />
      ) : (
        <VolumeX className="h-3.5 w-3.5 text-muted-foreground/50" />
      )}
    </button>
  );
}
