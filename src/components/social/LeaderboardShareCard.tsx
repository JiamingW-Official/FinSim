"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Trophy, Medal } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export interface LeaderboardShareData {
  rank: number;
  totalPlayers: number;
  portfolioReturn: number; // percentage, e.g. 12.5 means +12.5%
  portfolioValue: number;
  winRate: number; // 0–100
  totalTrades: number;
}

interface LeaderboardShareCardProps {
  data: LeaderboardShareData;
  onClose: () => void;
}

export function LeaderboardShareCard({ data, onClose }: LeaderboardShareCardProps) {
  const { rank, totalPlayers, portfolioReturn, portfolioValue, winRate, totalTrades } = data;
  const topPct = totalPlayers > 0 ? (rank / totalPlayers) * 100 : 100;
  const isTop10 = topPct <= 10;
  const returnSign = portfolioReturn >= 0 ? "+" : "";

  const shareText = `I'm rank #${rank} of ${totalPlayers.toLocaleString()} players in FinSim! Portfolio: ${formatCurrency(portfolioValue)} (${returnSign}${portfolioReturn.toFixed(1)}%), Win rate: ${winRate.toFixed(0)}%. finsim.app`;

  const handleCopy = () => {
    navigator.clipboard
      .writeText(shareText)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Copy failed — try manually"));
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-background/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-widest text-primary">FINSIM</span>
          <span className="text-xs text-muted-foreground">Leaderboard</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col items-center gap-4 px-6 py-5">
        {/* Rank display */}
        <div className="flex flex-col items-center gap-1">
          {rank === 1 ? (
            <Trophy className="h-10 w-10 text-yellow-400" />
          ) : (
            <Medal className="h-10 w-10 text-primary" />
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-muted-foreground">#</span>
            <span className="text-5xl font-bold tabular-nums text-foreground">{rank}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            of {totalPlayers.toLocaleString()} players
          </div>
        </div>

        {/* Top N% badge */}
        {isTop10 && (
          <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            Top {Math.ceil(topPct)}% of all players
          </div>
        )}

        {/* Stats grid */}
        <div className="grid w-full grid-cols-3 gap-2 rounded-lg bg-background/60 px-3 py-3 text-center text-xs">
          <div>
            <div className="text-muted-foreground">Return</div>
            <div className={`font-bold tabular-nums ${portfolioReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {returnSign}{portfolioReturn.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Win Rate</div>
            <div className="font-bold tabular-nums">{winRate.toFixed(0)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground">Trades</div>
            <div className="font-bold tabular-nums">{totalTrades}</div>
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground">finsim.app</div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-border px-4 py-3">
        <button
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-[11px] font-bold text-white transition-colors hover:bg-primary/90 active:bg-primary/80"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy Share Text
        </button>
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-3 py-2 text-[11px] font-bold text-muted-foreground transition-colors hover:bg-accent"
        >
          Dismiss
        </button>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Modal wrapper
// ─────────────────────────────────────────────

interface LeaderboardShareModalProps {
  data: LeaderboardShareData | null;
  onClose: () => void;
}

export function LeaderboardShareModal({ data, onClose }: LeaderboardShareModalProps) {
  return (
    <AnimatePresence>
      {data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <LeaderboardShareCard data={data} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// Trigger button (drop into leaderboard pages)
// ─────────────────────────────────────────────

interface LeaderboardShareButtonProps {
  data: LeaderboardShareData;
}

export function LeaderboardShareButton({ data }: LeaderboardShareButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Trophy className="h-3.5 w-3.5" />
        Share Rank
      </button>
      <LeaderboardShareModal data={open ? data : null} onClose={() => setOpen(false)} />
    </>
  );
}
