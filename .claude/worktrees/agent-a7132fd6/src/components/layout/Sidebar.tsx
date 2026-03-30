"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, BarChart3, PieChart, FlaskConical, GraduationCap,
  Swords, ScrollText, Crosshair, Trophy, User, Settings, Activity,
  TrendingUp, Globe,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    items: [
      { icon: Home, label: "Home", href: "/home" },
    ],
  },
  {
    items: [
      { icon: BarChart3,    label: "Trade",     href: "/trade" },
      { icon: Activity,     label: "Options",   href: "/options" },
      { icon: PieChart,      label: "Portfolio", href: "/portfolio" },
      { icon: FlaskConical, label: "Backtest",  href: "/backtest" },
      { icon: TrendingUp,   label: "Predictions", href: "/predictions" },
      { icon: Globe,         label: "Market Intel", href: "/market" },
    ],
  },
  {
    items: [
      { icon: GraduationCap, label: "Learn",      href: "/learn" },
      { icon: Swords,        label: "Challenges", href: "/challenges" },
      { icon: ScrollText,    label: "Quests",     href: "/quests" },
      { icon: Crosshair,     label: "Arena",      href: "/arena" },
    ],
  },
  {
    items: [
      { icon: Trophy,   label: "Leaderboard", href: "/leaderboard" },
      { icon: User,     label: "Profile",     href: "/profile" },
      { icon: Settings, label: "Settings",    href: "/settings" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="relative hidden md:flex w-14 flex-col items-center border-r border-border/50 bg-sidebar py-3 gap-0">
      {/* Nav groups */}
      <div className="flex w-full flex-col items-center flex-1">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className="flex w-full flex-col items-center">
            {gi > 0 && (
              <div className="my-2 w-5 h-px bg-border/40" />
            )}

            {group.items.map((item) => {
              const isActive = pathname === item.href;

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
                      <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />

                      {/* Left-edge active indicator — subtle bar */}
                      {isActive && (
                        <span className="absolute -left-[9px] top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r-full bg-primary" aria-hidden="true" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10} className="text-xs font-medium">
                    {item.label}
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
