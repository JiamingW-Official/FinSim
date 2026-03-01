"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Zap, TrendingUp, Shield, RefreshCw, Target,
  Trophy, Crosshair, Flame,
} from "lucide-react";
import { ArenaRankBadge } from "./ArenaRankBadge";
import { ARENA_TYPES } from "@/data/arena/arena-config";
import { useArenaStore } from "@/stores/arena-store";
import type { ArenaType, ArenaTypeConfig } from "@/types/arena";

const ARENA_ICONS: Record<string, React.ReactNode> = {
  Zap: <Zap className="h-5 w-5" />,
  TrendingUp: <TrendingUp className="h-5 w-5" />,
  Shield: <Shield className="h-5 w-5" />,
  RefreshCw: <RefreshCw className="h-5 w-5" />,
  Target: <Target className="h-5 w-5" />,
};

const WEIGHT_COLORS: Record<string, string> = {
  pnl: "bg-emerald-500/40",
  riskControl: "bg-blue-500/40",
  efficiency: "bg-amber-500/40",
  speed: "bg-red-500/40",
};

interface ArenaLobbyProps {
  onSelectType: (config: ArenaTypeConfig) => void;
}

export function ArenaLobby({ onSelectType }: ArenaLobbyProps) {
  const elo = useArenaStore((s) => s.elo);
  const rank = useArenaStore((s) => s.rank);
  const totalMatches = useArenaStore((s) => s.totalMatches);
  const totalWins = useArenaStore((s) => s.totalWins);
  const currentStreak = useArenaStore((s) => s.currentStreak);
  const bestStreak = useArenaStore((s) => s.bestStreak);
  const typeStats = useArenaStore((s) => s.typeStats);

  const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Player stats banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/5 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 p-4"
      >
        <div className="flex items-center gap-4">
          <ArenaRankBadge rank={rank} size="lg" />

          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black tabular-nums text-zinc-100">{elo}</span>
              <span className="text-xs text-zinc-500">ELO</span>
            </div>
            {totalMatches === 0 && (
              <p className="text-[10px] text-zinc-600 mt-0.5">Play your first match to start ranking!</p>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-center">
              <div className="font-bold tabular-nums text-zinc-200">{totalWins}/{totalMatches}</div>
              <div className="text-zinc-600">W/L</div>
            </div>
            <div className="text-center">
              <div className="font-bold tabular-nums text-zinc-200">{winRate}%</div>
              <div className="text-zinc-600">Win Rate</div>
            </div>
            {currentStreak > 0 && (
              <motion.div
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <div className="flex items-center gap-0.5 font-bold tabular-nums text-orange-400">
                  <Flame className="h-3 w-3" />
                  {currentStreak}
                </div>
                <div className="text-zinc-600">Streak</div>
              </motion.div>
            )}
            {bestStreak > 0 && currentStreak === 0 && (
              <div className="text-center">
                <div className="font-bold tabular-nums text-zinc-400">{bestStreak}</div>
                <div className="text-zinc-600">Best</div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Arena type cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ARENA_TYPES.map((config, i) => {
          const stats = typeStats[config.id as ArenaType];
          return (
            <motion.button
              type="button"
              key={config.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectType(config)}
              className={cn(
                "group relative overflow-hidden rounded-xl border p-4 text-left transition-all",
                "border-white/5 hover:border-white/10",
                "bg-white/[0.02] hover:bg-white/[0.05]",
              )}
            >
              {/* Colored top accent */}
              <div className={cn("absolute inset-x-0 top-0 h-0.5", config.bgColor.replace("/10", "/50"))} />

              {/* Icon + title */}
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", config.bgColor, config.color)}>
                  {ARENA_ICONS[config.icon] ?? <Crosshair className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className={cn("text-sm font-bold", config.color)}>{config.name}</h3>
                  <span className="text-[10px] text-zinc-600">{config.timeLimitSeconds}s</span>
                </div>
              </div>

              <p className="text-xs text-zinc-500 mb-3">{config.description}</p>

              {/* Scoring weights mini-bar */}
              <div className="space-y-1">
                {Object.entries(config.scoringWeights).map(([key, weight]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-[9px] w-12 text-zinc-600 capitalize">{key === "riskControl" ? "Risk" : key}</span>
                    <div className="flex-1 h-1 rounded-full bg-white/5">
                      <motion.div
                        className={cn("h-full rounded-full", WEIGHT_COLORS[key] ?? "bg-zinc-600")}
                        initial={{ width: 0 }}
                        animate={{ width: `${weight * 100}%` }}
                        transition={{ duration: 0.4, delay: i * 0.05 + 0.2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats if played */}
              {stats && stats.matches > 0 && (
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-3 text-[10px] text-zinc-500">
                  <span>{stats.wins}/{stats.matches} W</span>
                  <span className="text-zinc-600">|</span>
                  <span>Best: {stats.bestScore}</span>
                </div>
              )}

              {/* Hover CTA */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center rounded-b-xl bg-gradient-to-t from-black/40 to-transparent py-3 opacity-0 transition-opacity group-hover:opacity-100">
                <span className={cn("flex items-center gap-1.5 text-xs font-bold", config.color)}>
                  <Crosshair className="h-3 w-3" />
                  Find Match
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Recent matches */}
      {totalMatches > 0 && <RecentMatches />}
    </div>
  );
}

function RecentMatches() {
  const history = useArenaStore((s) => s.matchHistory);
  const recent = history.slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
    >
      <h3 className="text-xs font-bold text-zinc-400 mb-3 flex items-center gap-1.5">
        <Trophy className="h-3 w-3" />
        Recent Matches
      </h3>

      <div className="space-y-2">
        {recent.map((m, i) => (
          <motion.div
            key={m.matchId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-3 rounded-lg border border-white/[0.03] bg-white/[0.01] px-3 py-1.5 text-xs"
          >
            <span className={cn(
              "flex h-5 w-5 items-center justify-center rounded text-[10px] font-black",
              m.playerWon ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400",
            )}>
              {m.playerWon ? "W" : "L"}
            </span>
            <span className="text-zinc-400 flex-1 truncate">vs {m.opponentName}</span>
            <span className="text-zinc-600 tabular-nums">{m.playerScore} - {m.opponentScore}</span>
            <span className={cn("tabular-nums font-bold", m.eloChange >= 0 ? "text-emerald-400" : "text-red-400")}>
              {m.eloChange >= 0 ? "+" : ""}{m.eloChange}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
