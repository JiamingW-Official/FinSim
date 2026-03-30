"use client";

import { useMemo } from "react";
import { Flame, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  username: string;
  accuracy: number; // 0-100
  totalPredictions: number;
  brierScore: number; // 0.15-0.45 (lower = better)
  streak: number;
  isCurrentUser: boolean;
}

// mulberry32 seeded PRNG
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ADJECTIVES = [
  "Sharp", "Bold", "Swift", "Calm", "Keen", "Wise", "Cool",
  "Dark", "Bright", "Clear", "Deep", "Fast", "Hard", "Iron",
  "Just", "Kind", "Long", "Mild", "Open", "Pure",
];

const NOUNS = [
  "Hawk", "Eagle", "Wolf", "Bear", "Fox", "Lion", "Owl",
  "Bull", "Stag", "Raven", "Falcon", "Tiger", "Drake", "Shark",
  "Lynx", "Puma", "Crane", "Viper", "Pike", "Wren",
];

function generateLeaderboard(): LeaderboardEntry[] {
  const rand = mulberry32(54321);

  const bots: LeaderboardEntry[] = Array.from({ length: 20 }, (_, i) => {
    const adj = ADJECTIVES[Math.floor(rand() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(rand() * NOUNS.length)];
    const accuracy = 45 + Math.round(rand() * 30); // 45-75
    const totalPredictions = 10 + Math.round(rand() * 90); // 10-100
    const brierScore = 0.15 + rand() * 0.3; // 0.15-0.45
    const streak = Math.floor(rand() * 9); // 0-8

    return {
      rank: i + 1,
      username: `${adj}${noun}`,
      accuracy,
      totalPredictions,
      brierScore,
      streak,
      isCurrentUser: false,
    };
  });

  return bots;
}

// Stable list generated once at module level
const BOTS = generateLeaderboard();

export function PredictionLeaderboard() {
  const entries = useMemo<LeaderboardEntry[]>(() => {
    const currentUser: LeaderboardEntry = {
      rank: 0,
      username: "You",
      accuracy: 52,
      totalPredictions: 0,
      brierScore: 0.32,
      streak: 0,
      isCurrentUser: true,
    };

    const all = [...BOTS, currentUser].sort((a, b) => b.accuracy - a.accuracy);
    return all.map((entry, i) => ({ ...entry, rank: i + 1 }));
  }, []);

  const userRank = entries.find((e) => e.isCurrentUser)?.rank ?? entries.length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">
            Forecaster Rankings
          </span>
        </div>
        <span className="text-[9px] font-mono text-muted-foreground/35">
          Rank{" "}
          <span className="font-semibold text-foreground/70">#{userRank}</span>
          {" "}of {entries.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border/20 bg-card/30">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr className="border-b border-border/20">
              <th className="w-10 px-3 py-2 text-left">
                <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">#</span>
              </th>
              <th className="px-3 py-2 text-left">
                <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">Username</span>
              </th>
              <th className="px-3 py-2 text-right">
                <span className="flex items-center justify-end gap-1 text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">
                  <Target className="h-2.5 w-2.5" />
                  Accuracy
                </span>
              </th>
              <th className="px-3 py-2 text-right">
                <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">Preds</span>
              </th>
              <th className="px-3 py-2 text-right">
                <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">Brier</span>
              </th>
              <th className="px-3 py-2 text-right">
                <span className="flex items-center justify-end gap-1 text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">
                  <Flame className="h-2.5 w-2.5" />
                  Streak
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.username}
                className={cn(
                  "border-b border-border/10 last:border-0 transition-colors",
                  entry.rank === 1
                    ? "bg-amber-500/5 border-l-2 border-l-amber-500/30"
                    : entry.isCurrentUser
                    ? "bg-primary/5"
                    : "hover:bg-foreground/[0.02]",
                )}
              >
                {/* Rank */}
                <td className="px-3 py-1.5">
                  {entry.rank === 1 ? (
                    <span className="text-[10px] font-mono font-semibold tabular-nums text-amber-400/80">#1</span>
                  ) : entry.rank === 2 ? (
                    <span className="text-[10px] font-mono font-semibold tabular-nums text-muted-foreground/60">#2</span>
                  ) : entry.rank === 3 ? (
                    <span className="text-[10px] font-mono font-semibold tabular-nums text-muted-foreground/50">#3</span>
                  ) : (
                    <span className="text-[10px] font-mono tabular-nums text-muted-foreground/40">
                      #{entry.rank}
                    </span>
                  )}
                </td>

                {/* Username */}
                <td className="px-3 py-1.5">
                  <span
                    className={cn(
                      "text-[11px] font-medium",
                      entry.isCurrentUser
                        ? "text-primary"
                        : "text-foreground/80",
                    )}
                  >
                    {entry.username}
                  </span>
                  {entry.isCurrentUser && (
                    <span className="ml-1.5 rounded border border-primary/20 bg-primary/10 px-1 py-0.5 text-[9px] font-mono text-primary">
                      you
                    </span>
                  )}
                </td>

                {/* Accuracy */}
                <td className="px-3 py-1.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <div className="hidden sm:block w-16 h-1 overflow-hidden rounded-full bg-foreground/10">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          entry.accuracy >= 65
                            ? "bg-emerald-500/50"
                            : entry.accuracy >= 55
                            ? "bg-amber-500/50"
                            : "bg-foreground/20",
                        )}
                        style={{ width: `${entry.accuracy}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-[11px] font-mono font-semibold tabular-nums",
                        entry.accuracy >= 60
                          ? "text-emerald-400"
                          : entry.accuracy >= 50
                          ? "text-amber-400"
                          : "text-foreground/60",
                      )}
                    >
                      {entry.accuracy}%
                    </span>
                  </div>
                </td>

                {/* Total predictions */}
                <td className="px-3 py-1.5 text-right text-[10px] font-mono tabular-nums text-muted-foreground/40">
                  {entry.totalPredictions}
                </td>

                {/* Brier score */}
                <td className="px-3 py-1.5 text-right">
                  <span
                    className={cn(
                      "text-[11px] font-mono tabular-nums",
                      entry.brierScore <= 0.25
                        ? "text-emerald-400"
                        : entry.brierScore <= 0.35
                        ? "text-amber-400"
                        : "text-muted-foreground/40",
                    )}
                  >
                    {entry.brierScore.toFixed(3)}
                  </span>
                </td>

                {/* Streak */}
                <td className="px-3 py-1.5 text-right">
                  {entry.streak > 0 ? (
                    <span
                      className={cn(
                        "flex items-center justify-end gap-0.5 text-[10px] font-mono tabular-nums",
                        entry.streak >= 5
                          ? "text-amber-400"
                          : "text-muted-foreground/40",
                      )}
                    >
                      {entry.streak >= 5 && (
                        <Flame className="h-2.5 w-2.5" />
                      )}
                      {entry.streak}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-muted-foreground/20">--</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[9px] font-mono text-muted-foreground/35">
        Brier score: lower is better. Rankings update as accuracy improves.
      </p>
    </div>
  );
}
