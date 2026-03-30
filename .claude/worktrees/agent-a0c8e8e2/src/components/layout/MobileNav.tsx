"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  GraduationCap,
  Briefcase,
  User,
  Menu,
  TrendingUp,
  Globe,
  Activity,
  Trophy,
  Settings,
  TestTube2,
  Swords,
  ListTodo,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const PRIMARY_NAV = [
  { icon: Home, label: "Home", href: "/home" },
  { icon: BarChart3, label: "Trade", href: "/trade" },
  { icon: GraduationCap, label: "Learn", href: "/learn" },
  { icon: Briefcase, label: "Portfolio", href: "/portfolio" },
  { icon: User, label: "Profile", href: "/profile" },
];

const MORE_NAV = [
  { icon: TrendingUp, label: "Predict", href: "/predictions" },
  { icon: Globe, label: "Market", href: "/market" },
  { icon: Activity, label: "Options", href: "/options" },
  { icon: TestTube2, label: "Backtest", href: "/backtest" },
  { icon: Target, label: "Challenges", href: "/challenges" },
  { icon: ListTodo, label: "Quests", href: "/quests" },
  { icon: Swords, label: "Arena", href: "/arena" },
  { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = MORE_NAV.some((item) => pathname === item.href);

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          role="dialog"
          aria-label="More navigation"
          onClick={() => setShowMore(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="absolute bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 bg-card border-t border-border rounded-t-2xl p-4 grid grid-cols-3 gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="col-span-3 flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                More
              </span>
              <button
                type="button"
                onClick={() => setShowMore(false)}
                className="flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                aria-label="Close menu"
                data-compact=""
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path
                    d="M1 1L9 9M9 1L1 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            {MORE_NAV.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMore(false)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 text-[11px] font-medium transition-colors min-h-[56px]",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground active:bg-accent"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom nav bar — 3.5rem tall + safe area inset */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border/60 bg-card/95 backdrop-blur-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Primary navigation"
      >
        {PRIMARY_NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[3.5rem] py-2 px-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {/* Active indicator dot above icon */}
              {isActive && (
                <span
                  className="absolute top-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary"
                  aria-hidden="true"
                />
              )}
              <item.icon
                className={cn(
                  "h-5 w-5 transition-colors shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                aria-hidden="true"
              />
              {/* Label only on active tab to save space */}
              {isActive ? (
                <span className="text-[10px] font-semibold leading-none text-primary">
                  {item.label}
                </span>
              ) : (
                <span className="sr-only">{item.label}</span>
              )}
            </Link>
          );
        })}

        {/* More / overflow button */}
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          aria-label="More navigation options"
          aria-expanded={showMore}
          className={cn(
            "relative flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[3.5rem] py-2 px-1 transition-colors",
            showMore || isMoreActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          {(showMore || isMoreActive) && (
            <span
              className="absolute top-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary"
              aria-hidden="true"
            />
          )}
          <Menu
            className={cn(
              "h-5 w-5 transition-colors shrink-0",
              showMore || isMoreActive ? "text-primary" : "text-muted-foreground"
            )}
            aria-hidden="true"
          />
          {(showMore || isMoreActive) ? (
            <span className="text-[10px] font-semibold leading-none text-primary">More</span>
          ) : (
            <span className="sr-only">More</span>
          )}
        </button>
      </nav>
    </>
  );
}
