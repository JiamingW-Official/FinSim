"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Briefcase, FlaskConical, GraduationCap, Trophy, Settings } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: BarChart3, label: "Trade", href: "/trade" },
  { icon: Briefcase, label: "Portfolio", href: "/portfolio" },
  { icon: FlaskConical, label: "Backtest", href: "#", disabled: true },
  { icon: GraduationCap, label: "Learn", href: "/learn" },
  { icon: Trophy, label: "Leaderboard", href: "#", disabled: true },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-14 flex-col items-center border-r border-border bg-sidebar py-3 gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;

        if (item.disabled) {
          return (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <span className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground/40 cursor-not-allowed">
                  <item.icon className="h-4.5 w-4.5" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <span className="font-medium">{item.label}</span>
                <span className="ml-1.5 text-muted-foreground">Coming Soon</span>
              </TooltipContent>
            </Tooltip>
          );
        }

        return (
          <Tooltip key={item.label}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {item.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
