"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChartStore } from "@/stores/chart-store";
import { useTradingStore } from "@/stores/trading-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { WATCHLIST_STOCKS } from "@/types/market";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import { usePriceFlash, useAnimatedNumber } from "@/hooks/usePriceFlash";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Volume2,
  VolumeX,
  BookOpen,
  Plus,
  ChevronDown,
  Search,
  X,
} from "lucide-react";
import { useSettingsStore } from "@/stores/settings-store";
import { useLearnStore } from "@/stores/learn-store";
import { StreakBadge } from "@/components/game/StreakBadge";
import { useGameStore } from "@/stores/game-store";
import { getXPForNextLevel, LEVEL_THRESHOLDS } from "@/types/game";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { SearchTrigger } from "@/components/search/GlobalSearch";
import { HeartsDisplay } from "@/components/learn/HeartsDisplay";
import { usePathname } from "next/navigation";
import { INITIAL_CAPITAL } from "@/types/trading";

// ── Market status ─────────────────────────────────────────────────────────────

type MarketStatus = "open" | "pre" | "after" | "closed";

function getMarketStatus(): MarketStatus {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    weekday: "short",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const minute = parseInt(
    parts.find((p) => p.type === "minute")?.value ?? "0",
    10,
  );

  if (weekday === "Sat" || weekday === "Sun") return "closed";

  const total = hour * 60 + minute;
  if (total >= 9 * 60 + 30 && total < 16 * 60) return "open";
  if (total >= 4 * 60 && total < 9 * 60 + 30) return "pre";
  if (total >= 16 * 60 && total < 20 * 60) return "after";
  return "closed";
}

const STATUS_CFG: Record<MarketStatus, { dot: string; label: string }> = {
  open:   { dot: "bg-emerald-500", label: "Open" },
  pre:    { dot: "bg-amber-400",   label: "Pre-mkt" },
  after:  { dot: "bg-amber-400",   label: "After-mkt" },
  closed: { dot: "bg-red-500",     label: "Closed" },
};

function MarketStatusPill() {
  const [status, setStatus] = useState<MarketStatus>("closed");

  useEffect(() => {
    setStatus(getMarketStatus());
    const id = setInterval(() => setStatus(getMarketStatus()), 60_000);
    return () => clearInterval(id);
  }, []);

  const cfg = STATUS_CFG[status];
  return (
    <div className="flex items-center gap-1">
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      <span className="text-[10px] text-muted-foreground">{cfg.label}</span>
    </div>
  );
}

// ── Ticker search dropdown ────────────────────────────────────────────────────

function TickerDropdown({
  open,
  onClose,
  query,
  onQueryChange,
}: {
  open: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (v: string) => void;
}) {
  const setTicker = useChartStore((s) => s.setTicker);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const filtered = WATCHLIST_STOCKS.filter(
    (s) =>
      s.ticker.toLowerCase().includes(query.toLowerCase()) ||
      s.name.toLowerCase().includes(query.toLowerCase()),
  );

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-popover shadow-xl">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search ticker or name..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
          {query && (
            <button type="button" onClick={() => onQueryChange("")}>
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="max-h-48 overflow-y-auto py-1">
          {filtered.map((stock) => (
            <button
              key={stock.ticker}
              type="button"
              onClick={() => {
                setTicker(stock.ticker);
                onClose();
                onQueryChange("");
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-accent"
            >
              <span className="w-12 font-semibold text-foreground">
                {stock.ticker}
              </span>
              <span className="truncate text-muted-foreground">{stock.name}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              No results
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── XP progress bar ───────────────────────────────────────────────────────────

function XPProgressBar() {
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const currentLevelXP = level > 1 ? LEVEL_THRESHOLDS[level - 2] : 0;
  const nextLevelXP = getXPForNextLevel(level);
  const xpInLevel = xp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const xpPercent =
    level >= 50 ? 100 : Math.min((xpInLevel / xpNeeded) * 100, 100);

  return (
    <div className="flex items-center gap-1.5" data-tutorial="xp-level">
      <span className="text-xs font-black tabular-nums text-primary">
        Lv.{level}
      </span>
      <div
        className="h-1.5 w-16 overflow-hidden rounded-full bg-muted"
        title={`${xpInLevel} / ${xpNeeded} XP to next level`}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${xpPercent}%` }}
        />
      </div>
      <span className="text-[10px] tabular-nums text-muted-foreground">
        {xpInLevel}/{xpNeeded}
      </span>
    </div>
  );
}

// ── Quick actions dropdown ────────────────────────────────────────────────────

function QuickActionsMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const actions: { label: string; href: string }[] = [
    { label: "New Trade",     href: "/trade" },
    { label: "Open Journal",  href: "/journal" },
    { label: "Start Lesson",  href: "/learn" },
    { label: "Run Backtest",  href: "/backtest" },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-6 w-6 items-center justify-center rounded-md border border-border/60 bg-accent/40 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        title="Quick actions"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-border bg-popover shadow-xl py-1">
          {actions.map((a) => (
            <button
              key={a.href}
              type="button"
              onClick={() => {
                router.push(a.href);
                setOpen(false);
              }}
              className="flex w-full items-center px-3 py-1.5 text-left text-sm text-foreground hover:bg-accent"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sound toggle ──────────────────────────────────────────────────────────────

function SoundToggle() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const toggleSound = useSettingsStore((s) => s.toggleSound);

  return (
    <button
      type="button"
      onClick={toggleSound}
      className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
      title={soundEnabled ? "Mute sounds" : "Enable sounds"}
    >
      {soundEnabled ? (
        <Volume2 className="h-3.5 w-3.5" />
      ) : (
        <VolumeX className="h-3.5 w-3.5 text-muted-foreground/50" />
      )}
    </button>
  );
}

// ── Learn streak badge ────────────────────────────────────────────────────────

function LearnStreakBadge() {
  const learningStreak = useLearnStore((s) => s.learningStreak);
  if (learningStreak <= 0) return null;

  return (
    <div className="flex items-center gap-0.5 rounded-full bg-violet-500/10 px-1.5 py-0.5">
      <BookOpen className="h-3 w-3 text-violet-400" />
      <span className="text-[10px] font-bold tabular-nums text-violet-400">
        {learningStreak}
      </span>
    </div>
  );
}

// ── Main TopBar ───────────────────────────────────────────────────────────────

export function TopBar() {
  const { currentTicker } = useChartStore();
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const isPlaying = useMarketDataStore((s) => s.isPlaying);

  const currentBar =
    allData.length > 0 && revealedCount > 0
      ? allData[revealedCount - 1]
      : null;

  const stockInfo = WATCHLIST_STOCKS.find((s) => s.ticker === currentTicker);
  const price = currentBar?.close ?? 0;
  const priceFlash = usePriceFlash(price || undefined);
  const animatedPrice = useAnimatedNumber(price, 250);
  const animatedPortfolio = useAnimatedNumber(portfolioValue, 350);

  const dayChange =
    currentBar && currentBar.open > 0
      ? ((currentBar.close - currentBar.open) / currentBar.open) * 100
      : 0;

  const priceDisplay = price > 0 ? formatCurrency(animatedPrice) : "---";

  // Overall P&L vs initial capital
  const totalPnL = portfolioValue - INITIAL_CAPITAL;
  const totalPnLPct = (totalPnL / INITIAL_CAPITAL) * 100;

  const pathname = usePathname();

  // Ticker search state
  const [tickerOpen, setTickerOpen] = useState(false);
  const [tickerQuery, setTickerQuery] = useState("");

  return (
    <div className="relative glass flex h-10 items-center justify-between px-4 border-b border-border/30 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/20 after:to-transparent">
      {/* ── Left ── */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <span className="inline-flex items-center gap-1.5 select-none">
          <span className="text-sm font-black tracking-tight text-primary">FS</span>
          <span className="text-sm font-semibold tracking-wide text-foreground/80">FinSim</span>
        </span>

        <div className="h-4 w-px bg-border" />

        {/* Ticker — clickable to open search */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setTickerOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md px-1 py-0.5 text-sm hover:bg-accent/50 transition-colors"
          >
            <span className="font-semibold">{currentTicker}</span>
            <span className="hidden text-muted-foreground sm:inline">
              {stockInfo?.name ?? ""}
            </span>
            <span
              className={cn(
                "font-bold tabular-nums transition-colors duration-300",
                priceFlash === "up" && "price-flash-up",
                priceFlash === "down" && "price-flash-down",
              )}
            >
              {priceDisplay}
            </span>
            {currentBar && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium",
                  dayChange >= 0
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-red-500/10 text-red-500",
                )}
              >
                {dayChange >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {formatPercent(dayChange)}
              </span>
            )}
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          <TickerDropdown
            open={tickerOpen}
            onClose={() => setTickerOpen(false)}
            query={tickerQuery}
            onQueryChange={setTickerQuery}
          />
        </div>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-3 text-sm">
        {/* XP + streaks */}
        <XPProgressBar />
        <StreakBadge />
        <LearnStreakBadge />
        {pathname?.startsWith("/learn") && <HeartsDisplay compact />}

        <div className="h-4 w-px bg-border" />

        {/* Market status */}
        <MarketStatusPill />

        <div className="h-4 w-px bg-border" />

        {/* Actions cluster */}
        <SearchTrigger />
        <NotificationCenter />
        <SoundToggle />
        <QuickActionsMenu />

        <div className="h-4 w-px bg-border" />

        {/* Simulated date */}
        {currentBar && (
          <span className="text-xs text-muted-foreground">
            {formatDate(currentBar.timestamp)}
          </span>
        )}

        <div className="h-4 w-px bg-border" />

        {/* Portfolio value + P&L badge */}
        <div className="flex items-center gap-2" data-tutorial="portfolio">
          <span className="text-xs text-muted-foreground">Portfolio</span>
          <span
            className={cn(
              "font-semibold tabular-nums",
              totalPnL >= 0 ? "text-emerald-500" : "text-red-500",
            )}
          >
            {formatCurrency(animatedPortfolio)}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
              totalPnL >= 0
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-red-500/10 text-red-500",
            )}
          >
            {totalPnL >= 0 ? "+" : ""}
            {formatCurrency(totalPnL)}
            {" ("}
            {totalPnL >= 0 ? "+" : ""}
            {totalPnLPct.toFixed(1)}
            {"%)"}
          </span>
        </div>

        {/* LIVE indicator */}
        {isPlaying && (
          <div className="flex items-center gap-1">
            <div className="pulse-dot h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-emerald-500">LIVE</span>
          </div>
        )}
      </div>
    </div>
  );
}
