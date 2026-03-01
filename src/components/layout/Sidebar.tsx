"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, BarChart3, Briefcase, FlaskConical, GraduationCap, Swords, ScrollText, Crosshair, Trophy, User, Settings, Sparkles, Activity } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: Home, label: "Home", href: "/home", activeColor: "text-primary", activeBg: "bg-primary/12", dotColor: "bg-primary" },
  { icon: BarChart3, label: "Trade", href: "/trade", activeColor: "text-emerald-400", activeBg: "bg-emerald-500/12", dotColor: "bg-emerald-400" },
  { icon: Activity, label: "Options", href: "/options", activeColor: "text-orange-400", activeBg: "bg-orange-500/12", dotColor: "bg-orange-400" },
  { icon: Briefcase, label: "Portfolio", href: "/portfolio", activeColor: "text-blue-400", activeBg: "bg-blue-500/12", dotColor: "bg-blue-400" },
  { icon: FlaskConical, label: "Backtest", href: "/backtest", activeColor: "text-violet-400", activeBg: "bg-violet-500/12", dotColor: "bg-violet-400" },
  { icon: GraduationCap, label: "Learn", href: "/learn", activeColor: "text-amber-400", activeBg: "bg-amber-500/12", dotColor: "bg-amber-400" },
  { icon: Swords, label: "Challenges", href: "/challenges", activeColor: "text-rose-400", activeBg: "bg-rose-500/12", dotColor: "bg-rose-400" },
  { icon: ScrollText, label: "Quests", href: "/quests", activeColor: "text-cyan-400", activeBg: "bg-cyan-500/12", dotColor: "bg-cyan-400" },
  { icon: Crosshair, label: "Arena", href: "/arena", activeColor: "text-red-400", activeBg: "bg-red-500/12", dotColor: "bg-red-400" },
  { icon: Trophy, label: "Leaderboard", href: "/leaderboard", activeColor: "text-purple-400", activeBg: "bg-purple-500/12", dotColor: "bg-purple-400" },
  { icon: User, label: "Profile", href: "/profile", activeColor: "text-indigo-400", activeBg: "bg-indigo-500/12", dotColor: "bg-indigo-400" },
  { icon: Settings, label: "Settings", href: "/settings", activeColor: "text-gray-400", activeBg: "bg-gray-500/12", dotColor: "bg-gray-400" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-14 flex-col items-center border-r border-border bg-sidebar py-3 gap-1">
      {/* Logo mark */}
      <motion.div
        className="mb-3 flex h-8 w-8 items-center justify-center"
        whileHover={{ scale: 1.15, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
      >
        <span className="text-lg font-black gradient-text-brand select-none">A</span>
      </motion.div>

      <div className="divider-glow w-6 mb-2" />

      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Tooltip key={item.label}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
                  isActive
                    ? `${item.activeBg} ${item.activeColor} sidebar-active-indicator`
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <item.icon className="h-4.5 w-4.5" />
                </motion.div>

                {/* Active glow dot */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      className={cn("absolute -bottom-0.5 h-1 w-1 rounded-full", item.dotColor)}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    />
                  )}
                </AnimatePresence>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {item.label}
            </TooltipContent>
          </Tooltip>
        );
      })}

      <div className="flex-1" />

      {/* Bottom sparkle decoration */}
      <motion.div
        className="mb-1 text-muted-foreground/20"
        animate={{ rotate: [0, 180, 360], scale: [0.8, 1, 0.8] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="h-3 w-3" />
      </motion.div>
    </div>
  );
}
