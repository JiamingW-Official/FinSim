"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCompetitionStore } from "@/stores/competition-store";
import { useClockStore } from "@/stores/clock-store";
import { generateAIPlayers } from "@/services/ai-players/player-factory";

// ── Lobby names ──────────────────────────────────────────────────────────────

const DEFAULT_LOBBIES = [
  "Alpha Trading Room",
  "Sigma Capital",
  "Quantum Markets",
  "Apex Exchange",
  "Vanguard Floor",
  "Titan Fund",
  "Delta Arena",
  "Prime Desk",
];

function getDefaultLobby(): string {
  return DEFAULT_LOBBIES[Math.floor(Math.random() * DEFAULT_LOBBIES.length)];
}

// ── Strategy label ───────────────────────────────────────────────────────────

const STRATEGY_LABELS: Record<string, string> = {
  momentum: "Momentum",
  value: "Value",
  swing: "Swing",
  index: "Index",
  contrarian: "Contrarian",
  random: "Random",
};

// ── Component ────────────────────────────────────────────────────────────────

interface LobbyScreenProps {
  onStart?: () => void;
  className?: string;
}

export function LobbyScreen({ onStart, className }: LobbyScreenProps) {
  const [lobbyName, setLobbyName] = useState(getDefaultLobby);
  const initializeSeason = useCompetitionStore((s) => s.initializeSeason);
  const startSeasonClock = useClockStore((s) => s.startSeason);

  // Preview 5 AI players with a fixed preview seed
  const previewPlayers = useMemo(() => {
    return generateAIPlayers(5, 42);
  }, []);

  const handleStart = () => {
    initializeSeason(lobbyName.trim() || undefined);
    startSeasonClock();
    onStart?.();
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-background/95 backdrop-blur-sm",
        className,
      )}
    >
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-lg rounded-lg border border-border/40 bg-background p-8"
      >
        {/* Header */}
        <div className="mb-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2">
            New Season
          </p>
          <h2 className="text-xl font-semibold text-foreground/90">
            Historical Market Simulation
          </h2>
          <p className="mt-1 text-sm text-muted-foreground/60">
            Jan 2023 — Mar 2026 · Real market data
          </p>
        </div>

        {/* Starting capital */}
        <div className="mb-5 flex items-baseline justify-between border-b border-border/20 pb-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
            Starting Capital
          </span>
          <span className="font-mono text-lg tabular-nums text-foreground/90">
            $100,000
          </span>
        </div>

        {/* Lobby name */}
        <div className="mb-5">
          <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1.5">
            Lobby Name
          </label>
          <Input
            value={lobbyName}
            onChange={(e) => setLobbyName(e.target.value)}
            placeholder="Enter lobby name..."
            className="font-mono text-sm h-9"
          />
        </div>

        {/* AI competitors info */}
        <div className="mb-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2">
            25 AI Competitors
          </p>
          <div className="divide-y divide-border/20 rounded border border-border/20">
            {previewPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  {/* Avatar dot */}
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: `hsl(${player.avatarSeed % 360}, 40%, 55%)`,
                    }}
                  />
                  <span className="text-sm text-foreground/80">
                    {player.name}
                  </span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">
                  {STRATEGY_LABELS[player.strategy] ?? player.strategy}
                </span>
              </div>
            ))}
            <div className="px-3 py-2 text-center text-[11px] text-muted-foreground/40">
              + 20 more competitors
            </div>
          </div>
        </div>

        {/* Start button */}
        <Button
          onClick={handleStart}
          className="w-full h-10 font-mono text-xs uppercase tracking-widest"
        >
          Start Season
        </Button>
      </motion.div>
    </div>
  );
}
