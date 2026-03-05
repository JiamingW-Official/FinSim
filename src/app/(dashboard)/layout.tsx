"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { Providers } from "@/app/providers";
import { AchievementPopup } from "@/components/game/AchievementPopup";
import { LevelUpOverlay } from "@/components/game/LevelUpOverlay";
import { ComboIndicator } from "@/components/game/ComboIndicator";
import { PageTransition } from "@/components/motion/PageTransition";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";
import { DailyRewardsPopup } from "@/components/daily-rewards/DailyRewardsPopup";
import { SeasonXPToast } from "@/components/season/SeasonXPToast";
import { KeyboardShortcutGuide } from "@/components/game/KeyboardShortcutGuide";
import { ComboMeter } from "@/components/game/ComboMeter";
import { StreakCelebration } from "@/components/game/StreakCelebration";
import { TradeConfetti } from "@/components/game/TradeConfetti";
import { FloatingEmojis } from "@/components/game/FloatingEmojis";
import { usePreferencesStore } from "@/stores/preferences-store";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const colorblindMode = usePreferencesStore((s) => s.colorblindMode);

  return (
    <Providers>
      <div className={cn("flex h-screen flex-col overflow-hidden", colorblindMode && "colorblind-mode")}>
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="relative flex-1 overflow-hidden">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
        <StatusBar />
        <AchievementPopup />
        <LevelUpOverlay />
        <ComboIndicator />
        <ComboMeter />
        <TutorialOverlay />
        <DailyRewardsPopup />
        <SeasonXPToast />
        <KeyboardShortcutGuide />
        <StreakCelebration />
        <TradeConfetti />
        <FloatingEmojis />
      </div>
    </Providers>
  );
}
