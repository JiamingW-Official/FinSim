"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, BarChart3, Briefcase, FlaskConical, GraduationCap,
  Swords, ScrollText, Crosshair, Trophy, User, Settings, Activity,
  TrendingUp, Globe, ChevronLeft, ChevronRight, BookOpen, Bitcoin,
  ScanLine, GitCompare, Users, Landmark, BookMarked, DollarSign, Calculator, PieChart,
  Brain, Building2, Zap, Wallet, Calendar, Newspaper, Bot,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { SearchTrigger } from "@/components/search/GlobalSearch";
import { ThemeCustomizerTrigger } from "@/components/ui/ThemeCustomizer";
import { useUIStore } from "@/stores/ui-store";
import { useNotificationStore } from "@/stores/notification-store";
import { cn } from "@/lib/utils";

// ── Keyboard shortcuts ────────────────────────────────────────────────────────

const SHORTCUTS: Record<string, string> = {
  "/home":        "G H",
  "/trade":       "G T",
  "/options":     "G O",
  "/portfolio":   "G P",
  "/backtest":    "G B",
  "/predictions": "G D",
  "/performance": "G F",
  "/scanner":     "G N",
  "/market":      "G M",
  "/crypto":      "G Y",
  "/learn":       "G L",
  "/glossary":    "G G",
  "/challenges":  "G C",
  "/quests":      "G Q",
  "/arena":       "G A",
  "/leaderboard": "G R",
  "/profile":     "G U",
  "/settings":    "G S",
};

// ── Nav structure ─────────────────────────────────────────────────────────────

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badgeKey?: "achievements" | "quests";
}

interface NavGroup {
  section: string | null;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    section: null,
    items: [{ icon: Home, label: "Home", href: "/home" }],
  },
  {
    section: "Trading",
    items: [
      { icon: BarChart3,    label: "Trade",        href: "/trade" },
      { icon: Activity,     label: "Options",      href: "/options" },
      { icon: Briefcase,    label: "Portfolio",    href: "/portfolio" },
      { icon: FlaskConical, label: "Backtest",     href: "/backtest" },
      { icon: BookMarked,   label: "Strategies",   href: "/strategies" },
      { icon: TrendingUp,   label: "Predictions",  href: "/predictions" },
      { icon: TrendingUp,   label: "Performance",  href: "/performance" },
      { icon: ScanLine,     label: "Scanner",      href: "/scanner" },
      { icon: GitCompare,   label: "Pairs",        href: "/pairs" },
      { icon: Calendar,     label: "Earnings",     href: "/earnings" },
      { icon: Newspaper,    label: "News",         href: "/news" },
      { icon: Globe,        label: "Market Intel", href: "/market" },
      { icon: Globe,        label: "Macro",        href: "/macro" },
      { icon: Bitcoin,      label: "Crypto",       href: "/crypto" },
      { icon: Landmark,     label: "Bonds",        href: "/bonds" },
      { icon: PieChart,     label: "ETFs",         href: "/etf" },
      { icon: BarChart3,    label: "Futures",      href: "/futures" },
      { icon: DollarSign,   label: "Forex",        href: "/forex" },
      { icon: Calculator,   label: "Tax",          href: "/tax" },
      { icon: Wallet,       label: "Accounts",     href: "/accounts" },
      { icon: Building2,    label: "IPO Tracker",  href: "/ipo" },
      { icon: Zap,          label: "SPACs",        href: "/spacs" },
    ],
  },
  {
    section: "Learn",
    items: [
      { icon: GraduationCap, label: "Learn",      href: "/learn" },
      { icon: Brain,         label: "Quiz",       href: "/quiz" },
      { icon: BookOpen,      label: "Glossary",   href: "/glossary" },
      { icon: Swords,        label: "Challenges", href: "/challenges" },
      { icon: ScrollText,    label: "Quests",     href: "/quests",      badgeKey: "quests" },
      { icon: Crosshair,     label: "Arena",      href: "/arena" },
    ],
  },
  {
    section: "Social",
    items: [
      { icon: Users,  label: "Community",   href: "/community" },
      { icon: Trophy, label: "Leaderboard", href: "/leaderboard", badgeKey: "achievements" },
      { icon: User,   label: "Profile",     href: "/profile" },
    ],
  },
  {
    section: "Settings",
    items: [{ icon: Settings, label: "Settings", href: "/settings" }],
  },
];

// ── Single nav link ───────────────────────────────────────────────────────────

function NavLink({
  item,
  isActive,
  collapsed,
  badge,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  badge?: number;
}) {
  const shortcut = SHORTCUTS[item.href];

  const link = (
    <Link
      href={item.href}
      aria-label={item.label}
      className={cn(
        "group relative flex items-center rounded-md transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        collapsed
          ? "h-9 w-10 justify-center"
          : "h-8 w-full gap-2.5 px-2.5",
        isActive
          ? "bg-accent text-primary"
          : "text-muted-foreground/60 hover:bg-accent/50 hover:text-foreground/80",
      )}
    >
      {/* Left-edge active indicator */}
      {isActive && (
        <span className="absolute -left-[9px] top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r-full bg-primary" />
      )}

      <item.icon className="h-4 w-4 shrink-0" />

      {/* Label — expanded only */}
      {!collapsed && (
        <span className="flex-1 text-sm font-medium leading-none">{item.label}</span>
      )}

      {/* Shortcut hint — expanded, visible on hover */}
      {!collapsed && shortcut && (
        <span className="ml-auto hidden text-[9px] tabular-nums tracking-wide text-muted-foreground/40 group-hover:inline">
          {shortcut}
        </span>
      )}

      {/* Unread badge */}
      {badge != null && badge > 0 && (
        <span
          className={cn(
            "absolute flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-primary px-0.5 text-[8px] font-bold leading-none text-primary-foreground",
            collapsed ? "right-0.5 top-0.5" : "right-2 top-1/2 -translate-y-1/2 ml-auto",
          )}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );

  // Wrap in tooltip when collapsed
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={10} className="text-xs font-medium">
          <span>{item.label}</span>
          {shortcut && (
            <span className="ml-2 text-muted-foreground/60">{shortcut}</span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUIStore((s) => s.toggleSidebarCollapsed);

  // Unread badges from notification store
  const notifications = useNotificationStore((s) => s.notifications);
  const achievementBadge = notifications.filter(
    (n) => n.type === "achievement" && !n.read,
  ).length;
  const questBadge = notifications.filter(
    (n) => n.type === "quest" && !n.read,
  ).length;

  function getBadge(key?: NavItem["badgeKey"]): number | undefined {
    if (key === "achievements") return achievementBadge || undefined;
    if (key === "quests") return questBadge || undefined;
    return undefined;
  }

  return (
    <div
      className={cn(
        "relative hidden md:flex flex-col border-r border-border/50 bg-sidebar py-3 transition-[width] duration-200 ease-in-out overflow-hidden",
        collapsed ? "w-14 items-center" : "w-[200px] items-stretch",
      )}
    >
      {/* Logo mark */}
      <div
        className={cn(
          "mb-2 flex shrink-0 items-center justify-center rounded-md bg-primary/10",
          collapsed ? "h-8 w-8" : "mx-2.5 h-8 gap-2 px-2",
        )}
      >
        <span className="text-[13px] font-black tracking-tight text-primary select-none">
          FS
        </span>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-wide text-foreground/70 select-none">
            FinSim
          </span>
        )}
      </div>

      {/* Search trigger */}
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <SearchTrigger className="mb-2 h-9 w-10 justify-center" />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10} className="text-xs font-medium">
            Search (⌘K)
          </TooltipContent>
        </Tooltip>
      ) : (
        <SearchTrigger className="mb-2 mx-2.5 h-8 w-auto justify-start gap-2 px-2.5" />
      )}

      {/* Nav groups */}
      <div
        className={cn(
          "flex flex-1 flex-col overflow-y-auto overflow-x-hidden",
          collapsed ? "items-center w-full" : "px-2",
        )}
      >
        {NAV_GROUPS.map((group, gi) => (
          <div
            key={gi}
            className={cn(
              "flex flex-col",
              collapsed ? "items-center w-full" : "w-full",
            )}
          >
            {/* Separator / section label */}
            {gi > 0 &&
              (collapsed ? (
                <div className="my-2 h-px w-5 bg-border/40" />
              ) : (
                <div className="mb-1 mt-4 px-1">
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40 select-none">
                    {group.section}
                  </span>
                </div>
              ))}

            {group.items.map((item) => {
              const isActive = pathname === item.href;
              const badge = getBadge(item.badgeKey);
              return (
                <div
                  key={item.label}
                  className={cn(
                    "mb-0.5",
                    collapsed ? "flex w-full justify-center" : "w-full",
                  )}
                >
                  <NavLink
                    item={item}
                    isActive={isActive}
                    collapsed={collapsed}
                    badge={badge}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Theme customizer trigger */}
      <div
        className={cn(
          "mt-1 shrink-0",
          collapsed ? "flex w-full justify-center" : "px-2",
        )}
      >
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <ThemeCustomizerTrigger collapsed={collapsed} />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10} className="text-xs font-medium">
              Customize theme
            </TooltipContent>
          </Tooltip>
        ) : (
          <ThemeCustomizerTrigger collapsed={collapsed} />
        )}
      </div>

      {/* Collapse toggle */}
      <div
        className={cn(
          "mt-1 shrink-0",
          collapsed ? "flex w-full justify-center" : "px-2",
        )}
      >
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleCollapsed}
                className="flex h-9 w-10 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-accent/50 hover:text-foreground"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10} className="text-xs font-medium">
              Expand sidebar
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-muted-foreground/50 transition-colors hover:bg-accent/50 hover:text-foreground"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span className="text-xs font-medium">Collapse</span>
          </button>
        )}
      </div>
    </div>
  );
}
