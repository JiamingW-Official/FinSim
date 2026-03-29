"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, GraduationCap, TrendingUp, Globe, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  { label: "Glossary", href: "/glossary" },
  { label: "Challenges", href: "/challenges" },
  { label: "Quests", href: "/quests" },
  { label: "Arena", href: "/arena" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/settings" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute bottom-14 left-0 right-0 bg-card border-t border-border/40 rounded-t-xl p-3 grid grid-cols-3 gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {MORE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowMore(false)}
                className={cn(
                  "flex items-center justify-center rounded-lg py-2.5 text-xs font-medium transition-colors cursor-pointer",
                  pathname === item.href
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden h-14 items-center justify-around border-t border-border/50 bg-card/95 backdrop-blur-sm px-1 pb-[env(safe-area-inset-bottom)]"
      >
        {PRIMARY_NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <span className="h-1 w-1 rounded-full bg-primary" aria-hidden="true" />
              )}
            </Link>
          );
        })}
        <button
          onClick={() => setShowMore(!showMore)}
          aria-label="More navigation options"
          aria-expanded={showMore}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            showMore ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
          <span className="text-xs font-medium">More</span>
        </button>
      </nav>
    </>
  );
}
