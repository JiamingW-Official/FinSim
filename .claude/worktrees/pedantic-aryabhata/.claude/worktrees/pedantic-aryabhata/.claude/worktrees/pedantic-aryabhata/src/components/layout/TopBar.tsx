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
  Volume2,
  VolumeX,
  Plus,
  ChevronDown,
  Search,
  X,
  Keyboard,
} from "lucide-react";
import { useSettingsStore } from "@/stores/settings-store";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { INITIAL_CAPITAL } from "@/types/trading";
import { useShortcutsModal } from "@/components/ui/KeyboardShortcutsModal";

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
      <span className="text-xs text-muted-foreground">{cfg.label}</span>
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
      <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-popover">
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
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted/30"
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

// ── Keyboard shortcuts button ─────────────────────────────────────────────────

function ShortcutsButton() {
  const { openModal } = useShortcutsModal();
  return (
    <button
      type="button"
      onClick={openModal}
      className="rounded p-1 text-muted-foreground/40 transition-colors hover:text-foreground/70"
      title="Keyboard shortcuts (?)"
      aria-label="Open keyboard shortcuts guide"
    >
      <Keyboard className="h-3.5 w-3.5" />
    </button>
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
        className="flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground/40 transition-colors hover:bg-muted/30 hover:text-foreground/70"
        title="Quick actions"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-border bg-popover py-1">
          {actions.map((a) => (
            <button
              key={a.href}
              type="button"
              onClick={() => {
                router.push(a.href);
                setOpen(false);
              }}
              className="flex w-full items-center px-3 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-muted/30"
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
      className="rounded p-1 text-muted-foreground/40 transition-colors hover:text-foreground/70"
      title={soundEnabled ? "Mute sounds" : "Enable sounds"}
    >
      {soundEnabled ? (
        <Volume2 className="h-3.5 w-3.5" />
      ) : (
        <VolumeX className="h-3.5 w-3.5 opacity-50" />
      )}
    </button>
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

  // Ticker search state
  const [tickerOpen, setTickerOpen] = useState(false);
  const [tickerQuery, setTickerQuery] = useState("");

  return (
    <div className="relative flex h-9 items-center justify-between px-4 border-b border-border bg-background">
      {/* ── Left ── */}
      <div className="flex items-center gap-3">
        {/* Ticker — clickable to open search */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setTickerOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-muted/10 transition-colors"
          >
            <span className="text-xs font-medium">{currentTicker}</span>
            <span
              className={cn(
                "font-mono text-sm tabular-nums transition-colors duration-300",
                priceFlash === "up" && "price-flash-up",
                priceFlash === "down" && "price-flash-down",
              )}
            >
              {priceDisplay}
            </span>
            {currentBar && (
              <span
                className={cn(
                  "text-xs font-mono tabular-nums",
                  dayChange >= 0
                    ? "text-emerald-500"
                    : "text-red-500",
                )}
              >
                {dayChange >= 0 ? "+" : ""}{formatPercent(dayChange)}
              </span>
            )}
            <ChevronDown className="h-2.5 w-2.5 text-muted-foreground/50" />
          </button>

          <TickerDropdown
            open={tickerOpen}
            onClose={() => setTickerOpen(false)}
            query={tickerQuery}
            onQueryChange={setTickerQuery}
          />
        </div>

        <div className="h-3 w-px bg-border" />

        {/* Market status */}
        <MarketStatusPill />
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-2.5">
        {/* Simulated date */}
        {currentBar && (
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatDate(currentBar.timestamp)}
          </span>
        )}

        <div className="h-3 w-px bg-border" />

        {/* Portfolio value + P&L */}
        <div className="flex items-center gap-1.5" data-tutorial="portfolio">
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatCurrency(animatedPortfolio)}
          </span>
          <span
            className={cn(
              "text-xs tabular-nums",
              totalPnL >= 0 ? "text-emerald-500" : "text-red-500",
            )}
          >
            {totalPnL >= 0 ? "+" : ""}{totalPnLPct.toFixed(1)}%
          </span>
        </div>

        <div className="h-3 w-px bg-border" />

        {/* Actions cluster */}
        <ShortcutsButton />
        <ErrorBoundary name="NotificationCenter"><NotificationCenter /></ErrorBoundary>
        <SoundToggle />
        <QuickActionsMenu />

        {/* Sim status */}
        {isPlaying && (
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
            <span className="text-[10px] text-muted-foreground">SIM</span>
          </div>
        )}
      </div>
    </div>
  );
}
