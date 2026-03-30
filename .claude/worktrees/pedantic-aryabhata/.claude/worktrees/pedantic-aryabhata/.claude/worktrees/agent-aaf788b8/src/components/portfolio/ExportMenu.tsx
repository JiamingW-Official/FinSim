"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileSpreadsheet, FileText, Copy, Check } from "lucide-react";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import {
  exportTradeHistoryCSV,
  exportPortfolioReport,
  generateShareText,
  copyToClipboard,
} from "@/lib/export";
import { cn } from "@/lib/utils";

export function ExportMenu() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const level = useGameStore((s) => s.level);
  const title = useGameStore((s) => s.title);
  const xp = useGameStore((s) => s.xp);
  const stats = useGameStore((s) => s.stats);
  const achievements = useGameStore((s) => s.achievements);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  const totalPnL = portfolioValue - INITIAL_CAPITAL;
  const winRate =
    stats.totalTrades > 0
      ? ((stats.profitableTrades / stats.totalTrades) * 100).toFixed(1)
      : "0.0";

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleExportCSV = () => {
    exportTradeHistoryCSV(tradeHistory);
    setOpen(false);
  };

  const handleExportReport = () => {
    exportPortfolioReport({
      level,
      title,
      xp,
      portfolioValue,
      totalPnL,
      totalTrades: stats.totalTrades,
      profitableTrades: stats.profitableTrades,
      winRate,
      achievements: achievements.length,
      largestWin: stats.largestWin,
      consecutiveWins: stats.consecutiveWins,
    });
    setOpen(false);
  };

  const handleCopyStats = async () => {
    const text = generateShareText({
      level,
      title,
      portfolioValue,
      totalPnL,
      winRate,
      totalTrades: stats.totalTrades,
      achievements: achievements.length,
    });
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    }
    setOpen(false);
  };

  const ITEMS = [
    {
      icon: FileSpreadsheet,
      label: "Export Trades CSV",
      description: "Download trade history",
      onClick: handleExportCSV,
      color: "text-green-400",
    },
    {
      icon: FileText,
      label: "Export Report",
      description: "Download portfolio summary",
      onClick: handleExportReport,
      color: "text-blue-400",
    },
    {
      icon: copied ? Check : Copy,
      label: copied ? "Copied!" : "Copy Stats",
      description: "Copy to clipboard",
      onClick: handleCopyStats,
      color: copied ? "text-green-400" : "text-violet-400",
    },
  ];

  return (
    <div ref={menuRef} className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Export options"
        aria-expanded={open}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
          open
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Download className="h-4 w-4" aria-hidden="true" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
          >
            <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground">
              Export & Share
            </div>
            <div className="border-t border-border/50">
              {ITEMS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-accent/50 cursor-pointer"
                >
                  <item.icon className={cn("h-3.5 w-3.5", item.color)} />
                  <div>
                    <p className="text-[11px] font-bold">{item.label}</p>
                    <p className="text-[9px] text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
