"use client";

import { useState, useCallback } from "react";
import { ArenaLobby } from "@/components/arena/ArenaLobby";
import { ArenaMatchmaking } from "@/components/arena/ArenaMatchmaking";
import { ArenaPlayer } from "@/components/arena/ArenaPlayer";
import { ArenaResults } from "@/components/arena/ArenaResults";
import { ArenaRankBadge } from "@/components/arena/ArenaRankBadge";
import { DuelsTab } from "@/components/arena/DuelsTab";
import { BlackSwanTab } from "@/components/arena/BlackSwanTab";
import { TournamentTab } from "@/components/arena/TournamentTab";
import { TournamentSystem } from "@/components/arena/TournamentSystem";
import { useArenaStore } from "@/stores/arena-store";
import { useQuestStore } from "@/stores/quest-store";
import { useSeasonStore } from "@/stores/season-store";
import { Confetti } from "@/components/learn/Confetti";
import { soundEngine } from "@/services/audio/sound-engine";
import { cn } from "@/lib/utils";
import type { ArenaTypeConfig, ArenaNPC, ArenaMatchResult } from "@/types/arena";

type Phase = "lobby" | "matchmaking" | "playing" | "results";
type ActiveTab = "modes" | "duels" | "blackswan" | "tournament" | "tournaments";

const TABS: { id: ActiveTab; label: string }[] = [
  { id: "modes",       label: "Modes" },
  { id: "duels",       label: "Head-to-Head" },
  { id: "blackswan",   label: "Black Swan" },
  { id: "tournament",  label: "Classic" },
  { id: "tournaments", label: "Tournaments" },
];

export default function ArenaPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("modes");
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
      <div className="fixed inset-0 z-40 bg-background">
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
      <div className="fixed inset-0 z-40 bg-background">
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
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-sm font-medium">Practice Arena</h1>
            <p className="text-[11px] text-muted-foreground">
              Simulated competitive challenges to sharpen trading skills
            </p>
          </div>
          <div className="flex-1" />
          {/* Rank + stats inline */}
          {totalMatches > 0 ? (
            <div className="flex items-center gap-3">
              <ArenaRankBadge rank={rank} size="sm" />
              <div className="text-right">
                <p className="text-xs font-medium font-mono tabular-nums">{elo} ELO</p>
                <p className="text-[11px] text-muted-foreground">{totalMatches} matches</p>
              </div>
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground">No matches yet</span>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id !== "modes") setPhase("lobby");
            }}
            className={cn(
              "border-b-2 px-4 py-2 text-xs font-medium transition-colors",
              activeTab === tab.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {activeTab === "modes" && (
          <>
            <ArenaLobby onSelectType={handleSelectType} />
            {phase === "matchmaking" && selectedConfig && (
              <ArenaMatchmaking
                config={selectedConfig}
                onMatchReady={handleMatchReady}
                onCancel={handleMatchCancel}
              />
            )}
          </>
        )}

        {activeTab === "duels" && <DuelsTab />}

        {activeTab === "blackswan" && <BlackSwanTab />}

        {activeTab === "tournament" && <TournamentTab />}

        {activeTab === "tournaments" && <TournamentSystem />}
      </div>
    </div>
  );
}
