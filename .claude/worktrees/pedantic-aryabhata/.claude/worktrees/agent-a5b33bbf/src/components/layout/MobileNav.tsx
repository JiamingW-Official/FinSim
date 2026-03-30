"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, GraduationCap, TrendingUp, Globe, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";

const PRIMARY_NAV = [
  { icon: Home, label: "Home", href: "/home" },
  { icon: BarChart3, label: "Trade", href: "/trade" },
  { icon: GraduationCap, label: "Learn", href: "/learn" },
  { icon: TrendingUp, label: "Predict", href: "/predictions" },
  { icon: Globe, label: "Market", href: "/market" },
];

const MORE_NAV = [
  { label: "Portfolio", href: "/portfolio" },
  { label: "Options", href: "/options" },
  { label: "Backtest", href: "/backtest" },
  { label: "Challenges", href: "/challenges" },
  { label: "Quests", href: "/quests" },
  { label: "Arena", href: "/arena" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/settings" },
];

function hapticTap() {
  if (typeof navigator !== "undefined") {
    navigator.vibrate?.(10);
  }
}

export function MobileNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const handleMoreToggle = useCallback(() => {
    hapticTap();
    setShowMore((v) => !v);
  }, []);

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          role="dialog"
          aria-label="More navigation"
          onClick={() => { hapticTap(); setShowMore(false); }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute bottom-14 left-0 right-0 bg-card border-t border-border rounded-t-xl p-3 grid grid-cols-3 gap-2"
            style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
            onClick={(e) => e.stopPropagation()}
          >
            {MORE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { hapticTap(); setShowMore(false); }}
                className={cn(
                  "flex items-center justify-center rounded-lg py-2.5 text-xs font-medium transition-colors cursor-pointer",
                  pathname === item.href
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom nav bar — height is 56px + safe-area-inset-bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-end justify-around border-t border-border/50 bg-card/95 backdrop-blur-sm px-1"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Swipe hint — thin line at very top of bar suggesting swipeability */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 h-0.5 w-10 rounded-full bg-border/60" aria-hidden="true" />

        <div className="flex w-full items-center justify-around h-14">
          {PRIMARY_NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={hapticTap}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full rounded-lg transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {/* Active background circle */}
                {isActive && (
                  <span
                    className="absolute inset-x-2 inset-y-1.5 rounded-lg bg-primary/10"
                    aria-hidden="true"
                  />
                )}
                <item.icon className={cn("relative h-4 w-4 transition-transform", isActive && "scale-110")} />
                <span className={cn("relative text-[10px] font-medium", isActive && "font-semibold")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={handleMoreToggle}
            aria-label="More navigation options"
            aria-expanded={showMore}
            className={cn(
              "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full rounded-lg transition-colors",
              showMore ? "text-primary" : "text-muted-foreground"
            )}
          >
            {showMore && (
              <span
                className="absolute inset-x-2 inset-y-1.5 rounded-lg bg-primary/10"
                aria-hidden="true"
              />
            )}
            <Menu className="relative h-4 w-4" aria-hidden="true" />
            <span className="relative text-[10px] font-medium">More</span>
          </button>
        </div>
      </div>
    </>
  );
}
