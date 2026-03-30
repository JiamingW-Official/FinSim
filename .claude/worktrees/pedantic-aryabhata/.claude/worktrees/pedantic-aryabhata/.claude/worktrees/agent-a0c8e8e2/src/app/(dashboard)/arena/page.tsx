"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Crosshair, Zap } from "lucide-react";
import { ArenaLobby } from "@/components/arena/ArenaLobby";
import { ArenaMatchmaking } from "@/components/arena/ArenaMatchmaking";
import { ArenaPlayer } from "@/components/arena/ArenaPlayer";
import { ArenaResults } from "@/components/arena/ArenaResults";
import { ArenaRankBadge } from "@/components/arena/ArenaRankBadge";
import { useArenaStore } from "@/stores/arena-store";
import { useQuestStore } from "@/stores/quest-store";
import { useSeasonStore } from "@/stores/season-store";
import { Confetti } from "@/components/learn/Confetti";
import { soundEngine } from "@/services/audio/sound-engine";
import type { ArenaTypeConfig, ArenaNPC, ArenaMatchResult } from "@/types/arena";

type Phase = "lobby" | "matchmaking" | "playing" | "results";

export default function ArenaPage() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [selectedConfig, setSelectedConfig] = useState<ArenaTypeConfig | null>(null);
  const [currentOpponent, setCurrentOpponent] = useState<ArenaNPC | null>(null);
  const [matchResult, setMatchResult] = useState<ArenaMatchResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const rank = useArenaStore((s) => s.rank);
  const elo = useArenaStore((s) => s.elo);
  const totalMatches = useArenaStore((s) => s.totalMatches);
  const startMatch = useArenaStore((s) => s.startMatch);
  const completeMatch = useArenaStore((s) => s.completeMatch);
  const cancelMatch = useArenaStore((s) => s.cancelMatch);

  const handleSelectType = useCallback((config: ArenaTypeConfig) => {
    setSelectedConfig(config);
    setPhase("matchmaking");
  }, []);

  const handleMatchReady = useCallback((opponent: ArenaNPC) => {
    if (!selectedConfig) return;
    setCurrentOpponent(opponent);
    startMatch(selectedConfig.id, opponent, selectedConfig);
    setPhase("playing");
  }, [selectedConfig, startMatch]);

  const handleMatchCancel = useCallback(() => {
    cancelMatch();
    setPhase("lobby");
    setSelectedConfig(null);
  }, [cancelMatch]);

  const handleFinish = useCallback((playerResult: {
    pnl: number;
    pnlPercent: number;
    maxDrawdown: number;
    tradesCount: number;
    winRate: number;
    score: number;
    timeUsedSeconds: number;
  }) => {
    const result = completeMatch(playerResult);
    if (!result) return;

    setMatchResult(result);
    setPhase("results");

    // Quest + Season hooks for arena
    try {
      useQuestStore.getState().incrementSession("sessionArenaMatches");
      if (result.playerWon) useQuestStore.getState().incrementSession("sessionArenaWins");
    } catch { /* not loaded */ }

    try {
      useSeasonStore.getState().awardSeasonXP(result.playerWon ? "arena_win" : "arena_loss");
    } catch { /* not loaded */ }

    // Confetti for wins (sounds are handled in ArenaResults)
    if (result.playerWon) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [completeMatch]);

  const handlePlayAgain = useCallback(() => {
    if (!selectedConfig) return;
    setPhase("matchmaking");
    setMatchResult(null);
  }, [selectedConfig]);

  const handleBackToLobby = useCallback(() => {
    setPhase("lobby");
    setSelectedConfig(null);
    setCurrentOpponent(null);
    setMatchResult(null);
  }, []);

  // Full-screen player mode
  if (phase === "playing" && selectedConfig && currentOpponent) {
    return (
      <div className="fixed inset-0 z-40 bg-[#0a0e17]">
        <ArenaPlayer
          config={selectedConfig}
          opponent={currentOpponent}
          onFinish={handleFinish}
          onCancel={handleMatchCancel}
        />
        <Confetti show={showConfetti} />
      </div>
    );
  }

  // Results overlay
  if (phase === "results" && matchResult) {
    return (
      <div className="fixed inset-0 z-40 bg-[#0a0e17]">
        <ArenaResults
          result={matchResult}
          onPlayAgain={handlePlayAgain}
          onBackToLobby={handleBackToLobby}
        />
        <Confetti show={showConfetti} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Crosshair className="h-5 w-5 text-red-400" />
          </motion.div>
          <div>
            <h1 className="text-lg font-black">Arena</h1>
            <p className="text-[11px] text-muted-foreground">
              1v1 speed-trading duels
            </p>
          </div>
          <div className="flex-1" />
          {totalMatches > 0 && (
            <div className="flex items-center gap-2">
              <ArenaRankBadge rank={rank} size="sm" />
              <span className="text-xs tabular-nums text-zinc-500">{elo} ELO</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <ArenaLobby onSelectType={handleSelectType} />
      </div>

      {/* Matchmaking overlay */}
      {phase === "matchmaking" && selectedConfig && (
        <ArenaMatchmaking
          config={selectedConfig}
          onMatchReady={handleMatchReady}
          onCancel={handleMatchCancel}
        />
      )}
    </div>
  );
}
