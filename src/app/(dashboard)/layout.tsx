"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { StatusBar } from "@/components/layout/StatusBar";
import { Providers } from "@/app/providers";
import { AchievementPopup } from "@/components/game/AchievementPopup";
import { LevelUpOverlay } from "@/components/game/LevelUpOverlay";
import { PageTransition } from "@/components/motion/PageTransition";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";
import { DailyRewardsPopup } from "@/components/daily-rewards/DailyRewardsPopup";
import { SeasonXPToast } from "@/components/season/SeasonXPToast";
import { KeyboardShortcutGuide } from "@/components/game/KeyboardShortcutGuide";
import { StreakCelebration } from "@/components/game/StreakCelebration";
import { TradeConfetti } from "@/components/game/TradeConfetti";
import { FloatingEmojis } from "@/components/game/FloatingEmojis";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { MarketBell } from "@/components/game/MarketBell";
import { GlobalSearchProvider } from "@/components/search/GlobalSearch";
import { GlobalKeyboardShortcuts } from "@/hooks/useGlobalKeyboardShortcuts";
import { ShortcutsModalProvider } from "@/components/ui/KeyboardShortcutsModal";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const colorblindMode = usePreferencesStore((s) => s.colorblindMode);
 const hasHydrated = useOnboardingStore((s) => s._hasHydrated);
 const hasCompletedOnboarding = useOnboardingStore((s) => s.hasCompletedOnboarding);

 return (
 <Providers>
 <GlobalSearchProvider>
 <ShortcutsModalProvider>
 {/* Skip to main content — visible on focus for keyboard/screen reader users */}
 <a
 href="#main-content"
 className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[9999] focus:rounded-md focus:bg-primary focus:px-3 focus:py-1.5 focus:text-xs focus:font-medium focus:text-primary-foreground focus:"
 >
 Skip to content
 </a>

 <div className={cn("flex h-screen flex-col overflow-hidden bg-background", colorblindMode && "colorblind-mode")}>
 <TopBar />
 <div className="flex flex-1 overflow-hidden">
 <Sidebar />
 <main
 id="main-content"
 className="relative flex-1 overflow-hidden bg-background pb-16 md:pb-0"
 >
 <PageTransition>{children}</PageTransition>
 </main>
 </div>
 <StatusBar />
 {/* Mobile bottom navigation — only visible below md breakpoint */}
 <MobileNav />
 <AchievementPopup />
 <LevelUpOverlay />
 <TutorialOverlay />
 <DailyRewardsPopup />
 <SeasonXPToast />
 <KeyboardShortcutGuide />
 <StreakCelebration />
 <TradeConfetti />
 <FloatingEmojis />
 <MarketBell />
 {hasHydrated && !hasCompletedOnboarding && <OnboardingModal />}
 {/* Global keyboard shortcuts handler */}
 <GlobalKeyboardShortcuts />
 </div>
 </ShortcutsModalProvider>
 </GlobalSearchProvider>
 </Providers>
 );
}
