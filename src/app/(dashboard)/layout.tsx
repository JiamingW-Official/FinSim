"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { Providers } from "@/app/providers";
import { AchievementPopup } from "@/components/game/AchievementPopup";
import { LevelUpOverlay } from "@/components/game/LevelUpOverlay";

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
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
        <StatusBar />
        <AchievementPopup />
        <LevelUpOverlay />
      </div>
    </Providers>
  );
}
