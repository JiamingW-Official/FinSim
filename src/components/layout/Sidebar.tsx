"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, BarChart3, Briefcase, FlaskConical, GraduationCap,
  Swords, ScrollText, Crosshair, Trophy, User, Settings, Activity,
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
      { icon: Briefcase,    label: "Portfolio", href: "/portfolio" },
      { icon: FlaskConical, label: "Backtest",  href: "/backtest" },
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
    <div className="relative flex w-14 flex-col items-center border-r border-border/50 bg-sidebar py-3 gap-0">
      {/* Ambient top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(ellipse_120%_60%_at_50%_-10%,rgba(16,185,129,0.07),transparent)]" />

      {/* Logo mark */}
      <div className="relative mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20 shadow-[0_0_14px_rgba(16,185,129,0.12)]">
        <span className="text-[13px] font-black tracking-tight text-primary select-none">FS</span>
      </div>

      {/* Nav groups */}
      <div className="flex w-full flex-col items-center flex-1">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className="flex w-full flex-col items-center">
            {gi > 0 && (
              <div className="my-2 w-5 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
            )}

            {group.items.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "relative flex h-9 w-10 items-center justify-center rounded-lg transition-all duration-150 mb-0.5",
                        isActive
                          ? "bg-gradient-to-br from-primary/18 to-primary/6 text-primary shadow-[inset_0_0_0_1px_rgba(16,185,129,0.12)]"
                          : "text-muted-foreground/55 hover:bg-accent/50 hover:text-foreground/90",
                      )}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.88 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        <item.icon className={cn(
                          "h-4 w-4",
                          isActive && "drop-shadow-[0_0_4px_rgba(16,185,129,0.4)]",
                        )} />
                      </motion.div>

                      {/* Left-edge active indicator */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.span
                            className="absolute -left-[9px] top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r-full bg-gradient-to-b from-primary to-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                            initial={{ scaleY: 0, opacity: 0 }}
                            animate={{ scaleY: 1, opacity: 1 }}
                            exit={{ scaleY: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 600, damping: 30 }}
                          />
                        )}
                      </AnimatePresence>
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
    </div>
  );
}
