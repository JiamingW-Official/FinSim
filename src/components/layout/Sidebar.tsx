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

const NAV_ITEMS = [
  { icon: Home,          label: "Home",        href: "/home" },
  { icon: BarChart3,     label: "Trade",       href: "/trade" },
  { icon: Activity,      label: "Options",     href: "/options" },
  { icon: Briefcase,     label: "Portfolio",   href: "/portfolio" },
  { icon: FlaskConical,  label: "Backtest",    href: "/backtest" },
  { icon: GraduationCap, label: "Learn",       href: "/learn" },
  { icon: Swords,        label: "Challenges",  href: "/challenges" },
  { icon: ScrollText,    label: "Quests",      href: "/quests" },
  { icon: Crosshair,     label: "Arena",       href: "/arena" },
  { icon: Trophy,        label: "Leaderboard", href: "/leaderboard" },
  { icon: User,          label: "Profile",     href: "/profile" },
  { icon: Settings,      label: "Settings",    href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-14 flex-col items-center border-r border-border/60 bg-sidebar py-4 gap-0.5">
      {/* Logo mark */}
      <div className="mb-4 flex h-8 w-8 items-center justify-center">
        <span className="text-[15px] font-black tracking-tight text-primary select-none">FS</span>
      </div>

      <div className="w-5 h-px bg-border/50 mb-3" />

      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Tooltip key={item.label}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-150",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground/60 hover:bg-accent/40 hover:text-foreground",
                )}
              >
                <motion.div
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <item.icon className="h-4 w-4" />
                </motion.div>

                {/* Left-edge active indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      className="absolute -left-[9px] top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r-full bg-primary"
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      exit={{ scaleY: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 600, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10} className="text-xs">
              {item.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
