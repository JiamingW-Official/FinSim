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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex h-screen flex-col overflow-hidden">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-hidden">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
        <StatusBar />
        <AchievementPopup />
        <LevelUpOverlay />
        <ComboIndicator />
        <TutorialOverlay />
        <DailyRewardsPopup />
        <SeasonXPToast />
      </div>
    </Providers>
  );
}
