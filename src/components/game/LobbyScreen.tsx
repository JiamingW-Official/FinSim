"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCompetitionStore } from "@/stores/competition-store";
import { useClockStore } from "@/stores/clock-store";
import { generateAIPlayers } from "@/services/ai-players/player-factory";

const DEFAULT_LOBBIES = [
  "Alpha Trading Room", "Sigma Capital", "Quantum Markets",
  "Apex Exchange", "Vanguard Floor", "Titan Fund", "Delta Arena", "Prime Desk",
];

function getDefaultLobby(): string {
  return DEFAULT_LOBBIES[Math.floor(Math.random() * DEFAULT_LOBBIES.length)];
}

function getTodayStr(): string {
  return new Date().toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

const MECHANICS = [
  { icon: "⏱", label: "Time Scale", value: "6× Speed", desc: "4 real hours = 1 game trading day" },
  { icon: "📅", label: "Season", value: "Jan 2023 — Mar 2026", desc: "3+ years of real historical market data" },
  { icon: "💰", label: "Starting Capital", value: "$100,000", desc: "所有玩家相同起点" },
  { icon: "🕐", label: "Trading Hours", value: "4AM – 8PM ET", desc: "Pre-market · Regular · After-hours" },
  { icon: "🤖", label: "Competitors", value: "25 AI Players", desc: "Momentum · Value · Swing · Contrarian" },
  { icon: "🏆", label: "Win Condition", value: "Max Portfolio", desc: "Highest portfolio value at season end wins" },
];

const STRATEGY_LABELS: Record<string, string> = {
  momentum: "Momentum", value: "Value", swing: "Swing",
  index: "Index", contrarian: "Contrarian", random: "Random",
};

interface LobbyScreenProps {
  onStart?: () => void;
  className?: string;
}

export function LobbyScreen({ onStart, className }: LobbyScreenProps) {
  const [lobbyName, setLobbyName] = useState(getDefaultLobby);
  const initializeSeason = useCompetitionStore((s) => s.initializeSeason);
  const startSeasonClock = useClockStore((s) => s.startSeason);

  const previewPlayers = useMemo(() => generateAIPlayers(5, 42), []);

  const handleStart = () => {
    initializeSeason(lobbyName.trim() || undefined);
    startSeasonClock();
    onStart?.();
  };

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center", "bg-background/98 backdrop-blur-sm", className)}>
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-3xl rounded-xl border border-border/50 bg-background shadow-2xl overflow-hidden"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 bg-card/40">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-0.5">FinSim — Historical Market Simulator</div>
            <h1 className="text-xl font-bold text-foreground/95 tracking-tight">Select Server</h1>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-wider">Today's Server</div>
            <div className="font-mono text-xs font-semibold text-foreground/70">{getTodayStr()}</div>
            <div className="font-mono text-[10px] text-muted-foreground/40 mt-0.5">Resets daily at 00:00 EST · Day 1</div>
          </div>
        </div>

        {/* Body: 2-column */}
        <div className="grid grid-cols-2 divide-x divide-border/30">
          {/* LEFT: game mechanics */}
          <div className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-3">Game Rules</div>
            <div className="space-y-2">
              {MECHANICS.map((m) => (
                <div key={m.label} className="flex items-start gap-2.5 rounded-md p-2 bg-muted/5 hover:bg-muted/10 transition-colors">
                  <span className="text-base shrink-0 mt-0.5">{m.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wide">{m.label}</span>
                      <span className="text-xs font-semibold text-foreground/85">{m.value}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground/45 mt-0.5">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: lobby config + competitors */}
          <div className="p-5 flex flex-col gap-4">
            {/* Lobby name */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-1.5">
                Room Name
              </label>
              <Input
                value={lobbyName}
                onChange={(e) => setLobbyName(e.target.value)}
                placeholder="Enter lobby name..."
                className="font-mono text-sm h-8"
              />
            </div>

            {/* Capital */}
            <div className="flex items-center justify-between rounded-md border border-border/20 bg-muted/5 px-3 py-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">Starting Capital</span>
              <span className="font-mono text-base font-bold tabular-nums text-foreground/90">$100,000</span>
            </div>

            {/* AI competitors preview */}
            <div className="flex-1">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-1.5">
                AI Competitors <span className="text-muted-foreground/30 normal-case">(25 total)</span>
              </div>
              <div className="divide-y divide-border/15 rounded-md border border-border/20 bg-muted/5">
                {previewPlayers.map((player) => (
                  <div key={player.id} className="flex items-center justify-between px-2.5 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: `hsl(${player.avatarSeed % 360}, 40%, 55%)` }} />
                      <span className="text-xs text-foreground/70">{player.name}</span>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground/35">
                      {STRATEGY_LABELS[player.strategy] ?? player.strategy}
                    </span>
                  </div>
                ))}
                <div className="px-2.5 py-1.5 text-center text-[10px] text-muted-foreground/30">+ 20 more</div>
              </div>
            </div>

            {/* Start button */}
            <Button onClick={handleStart} className="w-full h-10 font-mono text-xs uppercase tracking-widest font-bold">
              Start Season
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
