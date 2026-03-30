"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CandlestickChart, Bitcoin, Activity,
  GraduationCap, BookOpen, BookMarked,
  PieChart, FlaskConical, ShieldAlert,
  Globe, TrendingUp, Coins,
  Swords, Trophy, ScrollText, Crosshair,
  Wrench, RotateCcw, Settings,
  User,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "",
    items: [
      { icon: Home, label: "Home", href: "/home" },
    ],
  },
  {
    label: "Trade",
    items: [
      { icon: CandlestickChart, label: "Trade",   href: "/trade" },
      { icon: Activity,         label: "Options", href: "/options" },
      { icon: Bitcoin,          label: "Crypto",  href: "/crypto" },
    ],
  },
  {
    label: "Learn",
    items: [
      { icon: GraduationCap, label: "Learn",      href: "/learn" },
      { icon: BookOpen,      label: "Flashcards", href: "/flashcards" },
      { icon: BookMarked,    label: "Glossary",   href: "/glossary" },
    ],
  },
  {
    label: "Analyze",
    items: [
      { icon: PieChart,     label: "Portfolio", href: "/portfolio" },
      { icon: FlaskConical, label: "Backtest",  href: "/backtest" },
      { icon: ShieldAlert,  label: "Risk",      href: "/risk" },
    ],
  },
  {
    label: "Markets",
    items: [
      { icon: Globe,      label: "Market Intel",  href: "/market" },
      { icon: TrendingUp, label: "Predictions",   href: "/predictions" },
      { icon: Coins,      label: "Tokenized RWA", href: "/tokenized" },
    ],
  },
  {
    label: "Arena",
    items: [
      { icon: Crosshair,  label: "Arena",       href: "/arena" },
      { icon: Trophy,     label: "Leaderboard", href: "/leaderboard" },
      { icon: ScrollText, label: "Quests",      href: "/quests" },
      { icon: Swords,     label: "Challenges",  href: "/challenges" },
    ],
  },
  {
    label: "Tools",
    items: [
      { icon: Wrench,    label: "Tools",    href: "/tools" },
      { icon: RotateCcw, label: "Replay",   href: "/replay" },
      { icon: Settings,  label: "Settings", href: "/settings" },
    ],
  },
  {
    label: "Profile",
    items: [
      { icon: User, label: "Profile", href: "/profile" },
    ],
  },
];

/**
 * Returns personalization hint labels keyed by href.
 * Returns empty object if onboarding not completed.
 */
function usePersonalizationHints(): Record<string, string> {
  const completed = useOnboardingStore((s) => s.completed);
  const experienceLevel = useOnboardingStore((s) => s.experienceLevel);
  const tradingStyle = useOnboardingStore((s) => s.tradingStyle);

  if (!completed) return {};

  const hints: Record<string, string> = {};

  if (experienceLevel === "beginner") {
    hints["/learn"] = "Start Here";
  }

  if (tradingStyle === "options") {
    hints["/options"] = "Recommended";
  }

  return hints;
}

export function Sidebar() {
  const pathname = usePathname();
  const hints = usePersonalizationHints();

  return (
    <nav
      aria-label="Main navigation"
      className="relative hidden md:flex w-14 flex-col items-center border-r border-border/50 bg-sidebar py-3 gap-0 overflow-y-auto"
    >
      <div className="flex w-full flex-col items-center flex-1">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className="flex w-full flex-col items-center">
            {/* Separator + group label between groups */}
            {gi > 0 && (
              <div className="mt-2 mb-1 w-full flex flex-col items-center">
                <div className="w-5 h-px bg-border/40 mb-1" />
                {group.label && (
                  <span className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground/50 leading-none mb-0.5">
                    {group.label}
                  </span>
                )}
              </div>
            )}

            {group.items.map((item) => {
              const isActive = pathname === item.href;
              const hint = hints[item.href];

              return (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      aria-label={item.label}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group relative flex h-9 w-10 items-center justify-center rounded-md transition-all duration-200 mb-0.5",
                        isActive
                          ? "border-l-2 border-primary text-foreground"
                          : "text-muted-foreground hover:bg-accent/30 hover:text-foreground",
                      )}
                    >
                      <item.icon
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />

                      {/* Left-edge active indicator bar */}
                      {isActive && (
                        <span
                          className="absolute -left-[9px] top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r-full bg-primary"
                          aria-hidden="true"
                        />
                      )}

                      {/* Personalization hint dot */}
                      {hint && !isActive && (
                        <span
                          className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary"
                          aria-hidden="true"
                        />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10} className="text-xs font-medium">
                    {hint ? (
                      <span>
                        {item.label}{" "}
                        <span className="ml-1 rounded bg-primary/20 px-1 py-0.5 text-[10px] font-semibold text-primary">
                          {hint}
                        </span>
                      </span>
                    ) : (
                      item.label
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}
