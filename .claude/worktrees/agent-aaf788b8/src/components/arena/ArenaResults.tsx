"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, Shield, Zap, Target, ArrowUp, ArrowDown, Star, Clock, Crosshair } from "lucide-react";
import { ArenaRankBadge } from "./ArenaRankBadge";
import { soundEngine } from "@/services/audio/sound-engine";
import type { ArenaMatchResult } from "@/types/arena";
import { getArenaRankForElo } from "@/types/arena";

interface ArenaResultsProps {
  result: ArenaMatchResult;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

/** Animated counter that counts up from 0 to target */
function useCountUp(target: number, duration: number, delay: number) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return value;
}

export function ArenaResults({ result, onPlayAgain, onBackToLobby }: ArenaResultsProps) {
  const prevRank = getArenaRankForElo(result.eloBefore);
  const newRank = getArenaRankForElo(result.eloAfter);
  const rankChanged = prevRank !== newRank && result.eloChange > 0;

  // Animated score counters
  const playerScoreAnim = useCountUp(result.playerScore, 1200, 400);
  const oppScoreAnim = useCountUp(result.opponentScore, 1200, 400);

  // Play sound on mount
  useEffect(() => {
    if (result.playerWon) {
      soundEngine.playArenaWin();
    } else {
      soundEngine.playArenaLose();
    }
  }, [result.playerWon]);

  // Format time used
  const mins = Math.floor(result.timeUsedSeconds / 60);
  const secs = Math.floor(result.timeUsedSeconds % 60);
  const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  // Scoring category labels and values for breakdown bars
  const categories = useMemo(() => [
    { label: "P&L", icon: <TrendingUp className="h-3 w-3" />, color: "bg-green-500", value: Math.max(0, Math.min(100, result.playerPnLPercent * 5 + 50)) },
    { label: "Risk", icon: <Shield className="h-3 w-3" />, color: "bg-blue-500", value: Math.max(0, 100 - result.playerMaxDrawdown * 5) },
    { label: "Win Rate", icon: <Zap className="h-3 w-3" />, color: "bg-amber-500", value: result.playerWinRate },
    { label: "Trades", icon: <Target className="h-3 w-3" />, color: "bg-purple-500", value: Math.min(100, result.playerTradesCount * 5) },
  ], [result.playerPnLPercent, result.playerMaxDrawdown, result.playerWinRate, result.playerTradesCount]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 p-6 overflow-y-auto">
      {/* Win/Loss banner */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="flex flex-col items-center gap-1"
      >
        <motion.span
          className={cn(
            "text-5xl font-black tracking-tight",
            result.playerWon ? "text-green-400" : "text-red-400",
          )}
          animate={result.playerWon ? { textShadow: ["0 0 20px rgba(16,185,129,0)", "0 0 40px rgba(16,185,129,0.3)", "0 0 20px rgba(16,185,129,0)"] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {result.playerWon ? "VICTORY!" : "DEFEAT"}
        </motion.span>
        <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Completed in {timeStr}
        </span>
      </motion.div>

      {/* Score comparison with animated counters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-8"
      >
        <motion.div
          className="flex flex-col items-center gap-1"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-xs text-muted-foreground">You</span>
          <span className={cn(
            "text-4xl font-black tabular-nums",
            result.playerWon ? "text-green-400" : "text-foreground/80",
          )}>
            {playerScoreAnim}
          </span>
        </motion.div>

        <motion.span
          className="text-2xl font-bold text-muted-foreground/40"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.35, type: "spring" }}
        >
          vs
        </motion.span>

        <motion.div
          className="flex flex-col items-center gap-1"
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-xs text-muted-foreground">{result.opponentName}</span>
          <span className={cn(
            "text-4xl font-black tabular-nums",
            !result.playerWon ? "text-red-400" : "text-muted-foreground",
          )}>
            {oppScoreAnim}
          </span>
        </motion.div>
      </motion.div>

      {/* Category breakdown bars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-md space-y-2"
      >
        {categories.map((cat, i) => (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.08 }}
            className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/10 px-3 py-2"
          >
            <span className="text-muted-foreground">{cat.icon}</span>
            <span className="text-[11px] text-muted-foreground w-14">{cat.label}</span>
            <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", cat.color)}
                initial={{ width: 0 }}
                animate={{ width: `${cat.value}%` }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <span className="text-[10px] font-bold tabular-nums text-muted-foreground w-8 text-right">
              {Math.round(cat.value)}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Detailed stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-md space-y-1.5"
      >
        <StatRow
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="P&L"
          value={`${result.playerPnLPercent >= 0 ? "+" : ""}${result.playerPnLPercent.toFixed(2)}%`}
          valueColor={result.playerPnLPercent >= 0 ? "text-green-400" : "text-red-400"}
          opponent={`${result.opponentPnLPercent >= 0 ? "+" : ""}${result.opponentPnLPercent.toFixed(2)}%`}
          opponentColor={result.opponentPnLPercent >= 0 ? "text-green-400/60" : "text-red-400/60"}
        />
        <StatRow
          icon={<Target className="h-3.5 w-3.5" />}
          label="Trades"
          value={`${result.playerTradesCount}`}
          valueColor="text-foreground"
        />
        <StatRow
          icon={<Shield className="h-3.5 w-3.5" />}
          label="Max DD"
          value={`${result.playerMaxDrawdown.toFixed(1)}%`}
          valueColor={result.playerMaxDrawdown < 5 ? "text-green-400" : "text-foreground"}
        />
        <StatRow
          icon={<Zap className="h-3.5 w-3.5" />}
          label="Win Rate"
          value={`${result.playerWinRate.toFixed(0)}%`}
          valueColor={result.playerWinRate >= 50 ? "text-green-400" : "text-foreground"}
        />
      </motion.div>

      {/* ELO change */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">ELO</span>
          <span className="text-lg font-bold tabular-nums text-muted-foreground">{result.eloBefore}</span>
          <motion.span
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className={cn(
              "flex items-center gap-1 text-lg font-black tabular-nums",
              result.eloChange >= 0 ? "text-green-400" : "text-red-400",
            )}
          >
            {result.eloChange >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            {result.eloChange >= 0 ? "+" : ""}{result.eloChange}
          </motion.span>
          <motion.span
            className="text-lg font-bold tabular-nums text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            {result.eloAfter}
          </motion.span>
        </div>

        {/* Rank badge */}
        <div className="flex items-center gap-2">
          <ArenaRankBadge rank={newRank} size="md" />
          {rankChanged && (
            <motion.span
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.1, type: "spring", stiffness: 400 }}
              className="text-xs font-black text-amber-400 flex items-center gap-1"
            >
              <Trophy className="h-3 w-3" />
              RANK UP!
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* XP earned */}
      {result.xpEarned > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-2"
        >
          <Star className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-bold text-amber-400">+{result.xpEarned} XP</span>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="flex items-center gap-3"
      >
        <motion.button
          type="button"
          onClick={onPlayAgain}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 rounded-lg bg-red-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm shadow-red-500/20 transition-colors hover:bg-red-400"
        >
          <Crosshair className="h-3.5 w-3.5" />
          Play Again
        </motion.button>
        <motion.button
          type="button"
          onClick={onBackToLobby}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-lg border border-border bg-muted/30 px-6 py-2.5 text-sm font-bold text-foreground/80 transition-colors hover:bg-muted/50"
        >
          Back to Lobby
        </motion.button>
      </motion.div>
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
  valueColor,
  opponent,
  opponentColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor: string;
  opponent?: string;
  opponentColor?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/10 px-3 py-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-[11px] text-muted-foreground flex-1">{label}</span>
      <span className={cn("text-xs font-bold tabular-nums", valueColor)}>{value}</span>
      {opponent && (
        <span className={cn("text-[10px] tabular-nums", opponentColor ?? "text-muted-foreground/60")}>
          vs {opponent}
        </span>
      )}
    </div>
  );
}
