"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, BarChart3, Briefcase, FlaskConical, GraduationCap,
  Swords, ScrollText, Crosshair, Trophy, User, Settings, Activity,
  TrendingUp, Globe, ChevronLeft, ChevronRight, ChevronDown, BookOpen, Bitcoin,
  ScanLine, GitCompare, Users, Landmark, BookMarked, DollarSign, Calculator, PieChart,
  Brain, Building2, Zap, Wallet, Calendar, Newspaper, Bot, LayoutGrid, Package, Search,
  Target, Compass, MoreHorizontal,
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
  badgeText?: string;
}

// ── Primary: always visible hero path ─────────────────────────────────────────

const PRIMARY_ITEMS: NavItem[] = [
  { icon: Home,          label: "Home",        href: "/home" },
  { icon: BarChart3,     label: "Trade",       href: "/trade" },
  { icon: GraduationCap, label: "Learn",       href: "/learn" },
  { icon: TrendingUp,    label: "Predictions", href: "/predictions", badgeText: "NEW" },
  { icon: Briefcase,     label: "Portfolio",   href: "/portfolio" },
];

// ── Explore: secondary tools, collapsible ─────────────────────────────────────

const EXPLORE_ITEMS: NavItem[] = [
  { icon: Activity,     label: "Options",     href: "/options" },
  { icon: FlaskConical, label: "Backtest",    href: "/backtest", badgeText: "NEW" },
  { icon: Globe,        label: "Market Intel", href: "/market" },
  { icon: Crosshair,    label: "Arena",       href: "/arena" },
  { icon: Swords,       label: "Challenges",  href: "/challenges" },
  { icon: ScrollText,   label: "Quests",      href: "/quests", badgeKey: "quests" },
];

// ── Advanced: collapsed by default, grouped by category ───────────────────────

interface AdvancedCategory {
  label: string;
  items: NavItem[];
}

const ADVANCED_CATEGORIES: AdvancedCategory[] = [
  {
    label: "Trading Tools",
    items: [
      { icon: Bot,          label: "Algo Trading",  href: "/algo" },
      { icon: BookMarked,   label: "Strategies",    href: "/strategies" },
      { icon: TrendingUp,   label: "Performance",   href: "/performance" },
      { icon: ScanLine,     label: "Scanner",       href: "/scanner" },
      { icon: Search,       label: "Screener",      href: "/screener" },
      { icon: GitCompare,   label: "Pairs",         href: "/pairs" },
    ],
  },
  {
    label: "Markets",
    items: [
      { icon: Globe,      label: "Macro",         href: "/macro" },
      { icon: LayoutGrid, label: "Sectors",        href: "/sectors" },
      { icon: Calendar,   label: "Earnings",       href: "/earnings" },
      { icon: Newspaper,  label: "News",           href: "/news" },
      { icon: Landmark,   label: "Central Banks",  href: "/centralbank" },
    ],
  },
  {
    label: "Fixed Income & FX",
    items: [
      { icon: Landmark,    label: "Bonds",       href: "/bonds" },
      { icon: DollarSign,  label: "Forex",       href: "/forex" },
      { icon: BarChart3,   label: "Futures",     href: "/futures" },
      { icon: Package,     label: "Commodities", href: "/commodities" },
    ],
  },
  {
    label: "Crypto",
    items: [
      { icon: Bitcoin, label: "Crypto", href: "/crypto" },
    ],
  },
  {
    label: "Wealth & Planning",
    items: [
      { icon: Landmark,    label: "Wealth Plan", href: "/wealth" },
      { icon: Target,      label: "Retirement",  href: "/retirement" },
      { icon: PieChart,    label: "ETFs",        href: "/etf" },
      { icon: Calculator,  label: "Tax",         href: "/tax" },
      { icon: Wallet,      label: "Accounts",    href: "/accounts" },
    ],
  },
  {
    label: "Alternative",
    items: [
      { icon: Building2, label: "IPO Tracker", href: "/ipo" },
      { icon: Zap,       label: "SPACs",       href: "/spacs" },
    ],
  },
];

// Flatten advanced items for active-route detection
const ALL_ADVANCED_HREFS = new Set(
  ADVANCED_CATEGORIES.flatMap((c) => c.items.map((i) => i.href))
);
const ALL_EXPLORE_HREFS = new Set(EXPLORE_ITEMS.map((i) => i.href));

// ── Learn & Social (always visible) ──────────────────────────────────────────

const LEARN_ITEMS: NavItem[] = [
  { icon: Brain,     label: "Quiz",       href: "/quiz" },
  { icon: BookOpen,  label: "Glossary",   href: "/glossary" },
];

const SOCIAL_ITEMS: NavItem[] = [
  { icon: Users,  label: "Social",      href: "/social" },
  { icon: Users,  label: "Community",   href: "/community" },
  { icon: Trophy, label: "Leaderboard", href: "/leaderboard", badgeKey: "achievements" },
  { icon: User,   label: "Profile",     href: "/profile" },
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

      {/* NEW badge text */}
      {!collapsed && item.badgeText && (
        <span className="ml-auto rounded bg-primary/15 px-1 py-0.5 text-[8px] font-bold uppercase leading-none text-primary">
          {item.badgeText}
        </span>
      )}

      {/* Shortcut hint — expanded, visible on hover (hidden when badgeText shown) */}
      {!collapsed && shortcut && !item.badgeText && (
        <span className="ml-auto hidden text-[11px] tabular-nums tracking-wide text-muted-foreground/40 group-hover:inline">
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
          {item.badgeText && (
            <span className="ml-1.5 rounded bg-primary/15 px-1 py-0.5 text-[7px] font-bold uppercase text-primary">
              {item.badgeText}
            </span>
          )}
          {shortcut && (
            <span className="ml-2 text-muted-foreground/60">{shortcut}</span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

// ── Collapsible section header ───────────────────────────────────────────────

function SectionToggle({
  label,
  icon: Icon,
  isOpen,
  onToggle,
  collapsed: sidebarCollapsed,
  hasActiveChild,
}: {
  label: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  collapsed: boolean;
  hasActiveChild: boolean;
}) {
  const btn = (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "group flex w-full items-center rounded-md transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        sidebarCollapsed
          ? "h-9 w-10 justify-center"
          : "h-8 gap-2.5 px-2.5",
        hasActiveChild
          ? "text-foreground/80"
          : "text-muted-foreground/50 hover:bg-accent/50 hover:text-foreground/70",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!sidebarCollapsed && (
        <>
          <span className="flex-1 text-left text-[10px] font-semibold uppercase tracking-wide leading-none">
            {label}
          </span>
          <ChevronDown
            className={cn(
              "h-3 w-3 shrink-0 transition-transform duration-200",
              isOpen ? "rotate-0" : "-rotate-90",
            )}
          />
        </>
      )}
    </button>
  );

  if (sidebarCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={10} className="text-xs font-medium">
          {label} {isOpen ? "(collapse)" : "(expand)"}
        </TooltipContent>
      </Tooltip>
    );
  }

  return btn;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUIStore((s) => s.toggleSidebarCollapsed);

  // Collapsible section state
  const [exploreOpen, setExploreOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Auto-expand a section if the current route is inside it
  useEffect(() => {
    if (ALL_EXPLORE_HREFS.has(pathname)) setExploreOpen(true);
    if (ALL_ADVANCED_HREFS.has(pathname)) setAdvancedOpen(true);
  }, [pathname]);

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

  const renderItems = useCallback(
    (items: NavItem[]) =>
      items.map((item) => {
        const isActive = pathname === item.href;
        const badge = getBadge(item.badgeKey);
        return (
          <div
            key={item.href}
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
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname, collapsed, achievementBadge, questBadge],
  );

  const hasActiveExplore = ALL_EXPLORE_HREFS.has(pathname);
  const hasActiveAdvanced = ALL_ADVANCED_HREFS.has(pathname);

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
        <span className="text-[13px] font-bold tracking-tight text-primary select-none">
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

      {/* Nav sections */}
      <div
        className={cn(
          "flex flex-1 flex-col overflow-y-auto overflow-x-hidden",
          collapsed ? "items-center w-full" : "px-2",
        )}
      >
        {/* ── PRIMARY: Hero path (always visible) ──────────────────────── */}
        <div className={cn("flex flex-col", collapsed ? "items-center w-full" : "w-full")}>
          {renderItems(PRIMARY_ITEMS)}
        </div>

        {/* ── Separator ────────────────────────────────────────────────── */}
        {collapsed ? (
          <div className="my-2 h-px w-5 bg-border/40" />
        ) : (
          <div className="my-2 h-px w-full bg-border/30" />
        )}

        {/* ── EXPLORE: Collapsible secondary tools ─────────────────────── */}
        <div className={cn("flex flex-col", collapsed ? "items-center w-full" : "w-full")}>
          <div className={cn("mb-0.5", collapsed ? "flex w-full justify-center" : "w-full")}>
            <SectionToggle
              label="Explore"
              icon={Compass}
              isOpen={exploreOpen}
              onToggle={() => setExploreOpen((o) => !o)}
              collapsed={collapsed}
              hasActiveChild={hasActiveExplore}
            />
          </div>
          <div
            className={cn(
              "flex flex-col overflow-hidden transition-all duration-200 ease-in-out",
              collapsed ? "items-center w-full" : "w-full",
              exploreOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
            )}
          >
            {renderItems(EXPLORE_ITEMS)}
          </div>
        </div>

        {/* ── Separator ────────────────────────────────────────────────── */}
        {collapsed ? (
          <div className="my-2 h-px w-5 bg-border/40" />
        ) : (
          <div className="my-2 h-px w-full bg-border/30" />
        )}

        {/* ── ADVANCED: Collapsed by default, all remaining pages ──────── */}
        <div className={cn("flex flex-col", collapsed ? "items-center w-full" : "w-full")}>
          <div className={cn("mb-0.5", collapsed ? "flex w-full justify-center" : "w-full")}>
            <SectionToggle
              label="More"
              icon={MoreHorizontal}
              isOpen={advancedOpen}
              onToggle={() => setAdvancedOpen((o) => !o)}
              collapsed={collapsed}
              hasActiveChild={hasActiveAdvanced}
            />
          </div>
          <div
            className={cn(
              "flex flex-col overflow-hidden transition-all duration-200 ease-in-out",
              collapsed ? "items-center w-full" : "w-full",
              advancedOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
            )}
          >
            {ADVANCED_CATEGORIES.map((cat) => (
              <div key={cat.label} className={cn("flex flex-col", collapsed ? "items-center w-full" : "w-full")}>
                {!collapsed && (
                  <div className="mb-0.5 mt-2 px-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground select-none">
                      {cat.label}
                    </span>
                  </div>
                )}
                {renderItems(cat.items)}
              </div>
            ))}
          </div>
        </div>

        {/* ── Separator ────────────────────────────────────────────────── */}
        {collapsed ? (
          <div className="my-2 h-px w-5 bg-border/40" />
        ) : (
          <div className="my-2 h-px w-full bg-border/30" />
        )}

        {/* ── LEARN & SOCIAL (always visible, compact) ─────────────────── */}
        <div className={cn("flex flex-col", collapsed ? "items-center w-full" : "w-full")}>
          {!collapsed && (
            <div className="mb-1 px-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground select-none">
                Learn
              </span>
            </div>
          )}
          {renderItems(LEARN_ITEMS)}
        </div>

        {collapsed ? (
          <div className="my-2 h-px w-5 bg-border/40" />
        ) : (
          <div className="my-2 h-px w-full bg-border/30" />
        )}

        <div className={cn("flex flex-col", collapsed ? "items-center w-full" : "w-full")}>
          {!collapsed && (
            <div className="mb-1 px-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground select-none">
                Social
              </span>
            </div>
          )}
          {renderItems(SOCIAL_ITEMS)}
        </div>
      </div>

      {/* Settings link */}
      <div
        className={cn(
          "mt-1 shrink-0",
          collapsed ? "flex w-full justify-center" : "px-2",
        )}
      >
        <NavLink
          item={{ icon: Settings, label: "Settings", href: "/settings" }}
          isActive={pathname === "/settings"}
          collapsed={collapsed}
        />
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
