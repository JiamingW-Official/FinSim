"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { MobileNav } from "@/components/layout/MobileNav";
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
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { DailyMissionsNotifier } from "@/components/notifications/DailyMissionsNotifier";
import { AnimatePresence } from "framer-motion";

import { usePreferencesStore } from "@/stores/preferences-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const colorblindMode = usePreferencesStore((s) => s.colorblindMode);
  const completed = useOnboardingStore((s) => s.completed);
  const skipped = useOnboardingStore((s) => s.skipped);
  const showOnboarding = !completed && !skipped;

  return (
    <Providers>
      <div className={cn("flex h-dvh flex-col", colorblindMode && "colorblind-mode")}>
        <TopBar />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <Sidebar />
          <main className="relative flex-1 overflow-hidden pb-14 md:pb-0 bg-[radial-gradient(ellipse_80%_30%_at_50%_0%,rgba(45,156,219,0.04),transparent)]">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
        <StatusBar />
        <MobileNav />
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
        <AnimatePresence>
          {showOnboarding && <OnboardingModal />}
        </AnimatePresence>
        <CommandPalette />
        <DailyMissionsNotifier />
      </div>
    </Providers>
  );
}
