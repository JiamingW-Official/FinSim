"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useGameStore } from "./game-store";

// ── Types ────────────────────────────────────────────────────────────────────

export type ChallengeType = "pnl_race" | "accuracy" | "risk_adjusted";

export interface ChallengeNPC {
  id: string;
  name: string;
  elo: number;
  winRate: number;
  currentStreak: number;
  recentStrategy: string;
  avatarSeed: number;
}

export interface ActiveChallenge {
  id: string; // unique per challenge instance
  npc: ChallengeNPC;
  type: ChallengeType;
  startedAt: number;

  // Shared progress
  tradesCompleted: number; // trades done since challenge start
  totalRequired: number; // always 5 for P&L Race, 10 for others

  // P&L Race
  userPnL: number; // realized P&L accumulated since start
  npcSimPnL: number; // simulated NPC P&L (deterministic from seed)

  // Accuracy Challenge (direction predictions)
  userCorrect: number; // bars where user had open position and price went their way
  npcCorrect: number; // simulated correct predictions

  // Risk-Adjusted (Sharpe proxy over trades)
  userReturns: number[]; // per-trade return %
  npcReturns: number[]; // simulated NPC returns

  completed: boolean;
  won: boolean | null;
  completedAt: number | null;
}

export interface CompletedChallenge {
  id: string;
  npcName: string;
  type: ChallengeType;
  won: boolean;
  completedAt: number;
  summary: string; // e.g. "+3.2% vs +2.8%"
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function seededRng(seed: number) {
  let s = seed === 0 ? 1 : Math.abs(seed);
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/** Generate a plausible NPC P&L value for a P&L race given seed + trade index. */
function simulateNPCPnL(seed: number, tradeIndex: number, capital: number): number {
  const rng = seededRng(seed + tradeIndex * 997);
  // NPC wins 55% of trades, avg win +2%, avg loss -1.5%
  const win = rng() < 0.55;
  const magnitude = win ? 0.01 + rng() * 0.025 : -(0.005 + rng() * 0.02);
  return capital * magnitude;
}

/** Simulate NPC direction accuracy (Accuracy Challenge). */
function simulateNPCAccuracy(seed: number, barIndex: number): boolean {
  const rng = seededRng(seed + barIndex * 1009);
  return rng() < 0.62; // NPC correct 62% of the time
}

/** Simulate NPC per-trade return % (Risk-Adjusted). */
function simulateNPCReturn(seed: number, tradeIndex: number): number {
  const rng = seededRng(seed + tradeIndex * 1013);
  const win = rng() < 0.55;
  return win ? 0.01 + rng() * 0.025 : -(0.005 + rng() * 0.02);
}

function sharpeFromReturns(returns: number[]): number {
  if (returns.length < 2) return 0;
  const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - avg) ** 2, 0) / returns.length;
  const std = Math.sqrt(variance);
  return std > 0 ? avg / std : 0;
}

function generateChallengeId(): string {
  return `btb-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function challengeTypeLabel(type: ChallengeType): string {
  switch (type) {
    case "pnl_race": return "P&L Race";
    case "accuracy": return "Accuracy Challenge";
    case "risk_adjusted": return "Risk-Adjusted";
  }
}

export function challengeTypeDescription(type: ChallengeType): string {
  switch (type) {
    case "pnl_race": return "Who gets better P&L in 5 trades";
    case "accuracy": return "Who predicts direction correctly in 10 bars";
    case "risk_adjusted": return "Who gets better Sharpe over 10 trades";
  }
}

export function totalRequiredForType(type: ChallengeType): number {
  return type === "pnl_race" ? 5 : 10;
}

// ── Store ────────────────────────────────────────────────────────────────────

interface BeatTheBestState {
  activeChallenges: ActiveChallenge[];
  completedChallenges: CompletedChallenge[];

  startChallenge: (npc: ChallengeNPC, type: ChallengeType) => void;
  updateProgress: (opts: {
    tradeTimestamp: number;
    realizedPnL: number | undefined;
    side: "buy" | "sell";
    capital: number;
  }) => void;
  dismissChallenge: (challengeId: string) => void;
  clearHistory: () => void;
}

export const useBeatTheBestStore = create<BeatTheBestState>()(
  persist(
    (set, get) => ({
      activeChallenges: [],
      completedChallenges: [],

      startChallenge: (npc, type) => {
        const existing = get().activeChallenges.find(
          (c) => c.npc.id === npc.id && !c.completed,
        );
        if (existing) return; // already active vs this NPC

        const total = totalRequiredForType(type);

        const challenge: ActiveChallenge = {
          id: generateChallengeId(),
          npc,
          type,
          startedAt: Date.now(),
          tradesCompleted: 0,
          totalRequired: total,
          userPnL: 0,
          npcSimPnL: 0,
          userCorrect: 0,
          npcCorrect: 0,
          userReturns: [],
          npcReturns: [],
          completed: false,
          won: null,
          completedAt: null,
        };

        set((s) => ({
          activeChallenges: [...s.activeChallenges, challenge],
        }));

        // Award a small amount of XP for accepting a challenge
        try {
          useGameStore.getState().awardXP(10);
        } catch { /* not loaded */ }
      },

      updateProgress: ({ tradeTimestamp, realizedPnL, side: _side, capital }) => {
        // Only closed trades (realizedPnL defined) count
        if (realizedPnL === undefined) return;

        set((s) => {
          const next = s.activeChallenges.map((ch) => {
            if (ch.completed) return ch;
            if (tradeTimestamp < ch.startedAt) return ch;

            const tradeIdx = ch.tradesCompleted;
            const seed = ch.npc.avatarSeed;

            let updated = { ...ch };

            if (ch.type === "pnl_race") {
              const npcTradeP = simulateNPCPnL(seed, tradeIdx, capital);
              updated = {
                ...updated,
                userPnL: updated.userPnL + realizedPnL,
                npcSimPnL: updated.npcSimPnL + npcTradeP,
                tradesCompleted: tradeIdx + 1,
              };
            } else if (ch.type === "accuracy") {
              // "correct" = realizedPnL > 0 means the trade direction was right
              const userCorrectBar = realizedPnL > 0;
              const npcCorrectBar = simulateNPCAccuracy(seed, tradeIdx);
              updated = {
                ...updated,
                userCorrect: updated.userCorrect + (userCorrectBar ? 1 : 0),
                npcCorrect: updated.npcCorrect + (npcCorrectBar ? 1 : 0),
                tradesCompleted: tradeIdx + 1,
              };
            } else {
              // risk_adjusted — normalise P&L to a % return of capital used
              // use realizedPnL / capital as a proxy for trade return
              const userReturn = capital > 0 ? realizedPnL / capital : 0;
              const npcReturn = simulateNPCReturn(seed, tradeIdx);
              updated = {
                ...updated,
                userReturns: [...updated.userReturns, userReturn],
                npcReturns: [...updated.npcReturns, npcReturn],
                tradesCompleted: tradeIdx + 1,
              };
            }

            // Check completion
            if (updated.tradesCompleted >= updated.totalRequired) {
              let won = false;
              let summary = "";

              if (ch.type === "pnl_race") {
                won = updated.userPnL > updated.npcSimPnL;
                const u = (updated.userPnL / capital * 100).toFixed(1);
                const n = (updated.npcSimPnL / capital * 100).toFixed(1);
                summary = `You: ${updated.userPnL >= 0 ? "+" : ""}${u}% | ${ch.npc.name}: ${updated.npcSimPnL >= 0 ? "+" : ""}${n}%`;
              } else if (ch.type === "accuracy") {
                won = updated.userCorrect > updated.npcCorrect;
                summary = `You: ${updated.userCorrect}/${updated.totalRequired} | ${ch.npc.name}: ${updated.npcCorrect}/${updated.totalRequired}`;
              } else {
                const uSharpe = sharpeFromReturns(updated.userReturns);
                const nSharpe = sharpeFromReturns(updated.npcReturns);
                won = uSharpe > nSharpe;
                summary = `Your Sharpe: ${uSharpe.toFixed(2)} | ${ch.npc.name}: ${nSharpe.toFixed(2)}`;
              }

              const completed: CompletedChallenge = {
                id: updated.id,
                npcName: ch.npc.name,
                type: ch.type,
                won,
                completedAt: Date.now(),
                summary,
              };

              // Award XP on win
              if (won) {
                try {
                  useGameStore.getState().awardXP(75);
                } catch { /* not loaded */ }
              }

              return {
                ...updated,
                completed: true,
                won,
                completedAt: Date.now(),
                _completed: completed,
              } as ActiveChallenge & { _completed: CompletedChallenge };
            }

            return updated;
          });

          // Separate newly-completed challenges
          const newCompleted: CompletedChallenge[] = [];
          const cleanActive = next.map((ch) => {
            const c = ch as ActiveChallenge & { _completed?: CompletedChallenge };
            if (c._completed) {
              newCompleted.push(c._completed);
              const { _completed: _, ...rest } = c;
              return rest as ActiveChallenge;
            }
            return ch;
          });

          return {
            activeChallenges: cleanActive,
            completedChallenges: [...s.completedChallenges, ...newCompleted],
          };
        });
      },

      dismissChallenge: (challengeId) => {
        set((s) => ({
          activeChallenges: s.activeChallenges.filter((c) => c.id !== challengeId),
        }));
      },

      clearHistory: () => {
        set({ completedChallenges: [] });
      },
    }),
    {
      name: "finsim-beat-the-best-v2",
      partialize: (state) => ({
        activeChallenges: state.activeChallenges,
        completedChallenges: state.completedChallenges,
      }),
    },
  ),
);
