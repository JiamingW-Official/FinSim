"use client";

import { useState } from "react";
import { Copy, Check, Share2, Trophy, TrendingUp } from "lucide-react";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { formatCurrency, cn } from "@/lib/utils";
import { INITIAL_CAPITAL } from "@/types/trading";
import { toast } from "sonner";

// Encode profile snapshot as base64 URL param
function encodeProfileData(data: Record<string, unknown>): string {
  try {
    return btoa(JSON.stringify(data));
  } catch {
    return "";
  }
}

// Derive trading style label from stats
function getTradingStyle(
  totalTrades: number,
  optionsTradesCount: number,
  shortTradesCount: number,
  limitOrdersUsed: number,
): string {
  if (optionsTradesCount > totalTrades * 0.3) return "Options Trader";
  if (shortTradesCount > totalTrades * 0.3) return "Short Seller";
  if (limitOrdersUsed > totalTrades * 0.5) return "Disciplined Buyer";
  if (totalTrades < 5) return "Getting Started";
  return "Momentum Trader";
}

export function PublicProfileCard() {
  const [copied, setCopied] = useState(false);

  const level = useGameStore((s) => s.level);
  const title = useGameStore((s) => s.title);
  const xp = useGameStore((s) => s.xp);
  const stats = useGameStore((s) => s.stats);
  const achievements = useGameStore((s) => s.achievements);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);

  const totalPnL = portfolioValue - INITIAL_CAPITAL;
  const winRate =
    stats.totalTrades > 0
      ? ((stats.profitableTrades / stats.totalTrades) * 100).toFixed(1)
      : "0.0";

  const tradingStyle = getTradingStyle(
    stats.totalTrades,
    stats.optionsTradesCount,
    stats.shortTradesCount,
    stats.limitOrdersUsed,
  );

  // Top 3 achievements (most recently unlocked)
  const topAchievements = [...achievements]
    .sort((a, b) => b.unlockedAt - a.unlockedAt)
    .slice(0, 3);

  const handleCopyLink = () => {
    const profileData = {
      level,
      title,
      xp,
      winRate,
      totalPnL: Math.round(totalPnL),
      tradingStyle,
      achievements: topAchievements.map((a) => a.name),
      totalTrades: stats.totalTrades,
    };

    const encoded = encodeProfileData(profileData);
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/profile?user=${encoded}`
        : `https://finsim.app/profile?user=${encoded}`;

    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Profile link copied!");
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error("Copy failed — try manually");
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold">Share Profile</span>
        </div>
        <span className="text-[10px] text-muted-foreground">400 × 250</span>
      </div>

      {/* 400×250 shareable card */}
      <div
        className="relative mx-auto border border-border/50 bg-background"
        style={{ width: 400, height: 250 }}
      >
        {/* Left column: level badge + stats */}
        <div className="absolute inset-y-0 left-0 flex flex-col justify-between p-5" style={{ width: 220 }}>
          {/* Level badge */}
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
                <span className="text-sm font-black text-primary tabular-nums">{level}</span>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-primary/70">
                  Level {level}
                </p>
                <p className="text-sm font-black leading-tight">{title}</p>
              </div>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">{tradingStyle}</p>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Win Rate</span>
              <span className="text-xs font-bold tabular-nums">{winRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Total P&L</span>
              <span
                className={cn(
                  "text-xs font-bold tabular-nums",
                  totalPnL >= 0 ? "text-green-400" : "text-red-400",
                )}
              >
                {totalPnL >= 0 ? "+" : ""}
                {formatCurrency(totalPnL)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Trades</span>
              <span className="text-xs font-bold tabular-nums">{stats.totalTrades}</span>
            </div>
          </div>

          {/* Watermark */}
          <p className="text-[8px] font-black tracking-widest text-muted-foreground/40">
            FINSIM.APP
          </p>
        </div>

        {/* Divider */}
        <div className="absolute inset-y-5 border-l border-border/50" style={{ left: 220 }} />

        {/* Right column: achievements */}
        <div className="absolute inset-y-0 right-0 flex flex-col justify-between p-5" style={{ width: 180 }}>
          <div>
            <div className="mb-2 flex items-center gap-1">
              <Trophy className="h-3 w-3 text-amber-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Achievements
              </p>
            </div>
            <div className="space-y-1.5">
              {topAchievements.length > 0 ? (
                topAchievements.map((a) => (
                  <div
                    key={a.id}
                    className="rounded border border-border/50 bg-muted/20 px-2 py-1"
                  >
                    <p className="truncate text-[10px] font-semibold">{a.name}</p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-muted-foreground">No achievements yet</p>
              )}
              {topAchievements.length < 3 &&
                Array.from({ length: 3 - topAchievements.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="rounded border border-dashed border-border/30 px-2 py-1"
                  >
                    <p className="text-[10px] text-muted-foreground/40">Locked</p>
                  </div>
                ))}
            </div>
          </div>

          {/* XP */}
          <div className="text-right">
            <p className="text-[9px] text-muted-foreground">Total XP</p>
            <p className="text-sm font-black tabular-nums text-primary">
              {xp.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Copy link action */}
      <div className="border-t border-border px-4 py-3">
        <button
          onClick={handleCopyLink}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2 text-xs font-semibold transition-colors hover:bg-muted/50 active:bg-muted/70"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy profile link
            </>
          )}
        </button>
        <p className="mt-1.5 text-center text-[9px] text-muted-foreground">
          Encodes your stats in the URL — no account required
        </p>
      </div>
    </div>
  );
}
