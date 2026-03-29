"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Trophy, Users, Clock, TrendingUp, TrendingDown, ChevronUp, ChevronDown,
  Star, Medal, Crown, Swords, Search, Award, BarChart2, Zap, Lock,
  CheckCircle, XCircle, Target,
} from "lucide-react";
import { useGameStore } from "@/stores/game-store";

// ── Seeded PRNG (mulberry32) ──────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Trader name pools ─────────────────────────────────────────────────────────

const FIRST = [
  "Alpha", "Quant", "Bear", "Bull", "Iron", "Night", "Storm", "Grid",
  "Sigma", "Delta", "Vega", "Theta", "Gamma", "Omega", "Byte", "Arc",
  "Peak", "Rise", "Dark", "Bold",
];
const LAST = [
  "Wolf", "King", "Rider", "Hawk", "Hand", "Runner", "Trader", "Hunter",
  "Blade", "Ghost", "Force", "Edge", "Mind", "Flex", "Strike", "Surge",
  "Quest", "Fire", "Rock", "Peak",
];

function makeName(rng: () => number): string {
  return FIRST[Math.floor(rng() * FIRST.length)] + LAST[Math.floor(rng() * LAST.length)];
}

// ── Types ─────────────────────────────────────────────────────────────────────

type TournamentId = "weekly_blitz" | "fundamentals" | "options_masters" | "elite_bracket";
type TournamentSection = "lobby" | "leaderboard" | "h2h" | "hall_of_fame";

interface TournamentDef {
  id: TournamentId;
  name: string;
  description: string;
  duration: string;
  durationDays: number;
  scoring: string;
  entryCost: number;
  entryLabel: string;
  prizes: number[];  // XP prizes for rank 1,2,3
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  inviteOnly: boolean;
}

const TOURNAMENTS: TournamentDef[] = [
  {
    id: "weekly_blitz",
    name: "Weekly Blitz",
    description: "7-day paper trading sprint. Highest returns win bonus XP.",
    duration: "7 days",
    durationDays: 7,
    scoring: "Total Return %",
    entryCost: 0,
    entryLabel: "Free",
    prizes: [500, 300, 100],
    icon: <Zap className="h-4 w-4" />,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/25",
    inviteOnly: false,
  },
  {
    id: "fundamentals",
    name: "Fundamentals Challenge",
    description: "14-day competition scored on Sharpe ratio + win rate, not just returns.",
    duration: "14 days",
    durationDays: 14,
    scoring: "Sharpe + Win Rate",
    entryCost: 0,
    entryLabel: "Free",
    prizes: [600, 350, 150],
    icon: <BarChart2 className="h-4 w-4" />,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-border",
    inviteOnly: false,
  },
  {
    id: "options_masters",
    name: "Options Masters",
    description: "Options-only trading for 7 days. Scored on risk-adjusted return.",
    duration: "7 days",
    durationDays: 7,
    scoring: "Risk-Adj. Return",
    entryCost: 100,
    entryLabel: "100 XP",
    prizes: [800, 500, 200],
    icon: <Target className="h-4 w-4" />,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-border",
    inviteOnly: false,
  },
  {
    id: "elite_bracket",
    name: "Elite Bracket",
    description: "Invite-only ELO-based matchmaking. 30-day endurance. High-stakes.",
    duration: "30 days",
    durationDays: 30,
    scoring: "ELO + Return",
    entryCost: 500,
    entryLabel: "500 XP",
    prizes: [2000, 1000, 500],
    icon: <Crown className="h-4 w-4" />,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/25",
    inviteOnly: true,
  },
];

interface LeaderboardEntry {
  rank: number;
  name: string;
  returnPct: number;
  sharpe: number;
  winRate: number;
  trades: number;
  eloChange: number;
  isPlayer: boolean;
  prevRank: number;
}

interface MatchRecord {
  id: string;
  opponent: string;
  opponentElo: number;
  yourReturn: number;
  oppReturn: number;
  won: boolean;
  eloChange: number;
  date: string;
}

interface TournamentBadge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  earned: boolean;
}

// ── PRNG-seeded data generators ───────────────────────────────────────────────

function generateLeaderboard(
  tournamentId: TournamentId,
  playerElo: number,
  playerXP: number,
): LeaderboardEntry[] {
  const seed = 1010 + TOURNAMENTS.findIndex((t) => t.id === tournamentId) * 100;
  const rng = mulberry32(seed);

  const entries: LeaderboardEntry[] = [];

  // Generate 19 NPC entries
  for (let i = 0; i < 19; i++) {
    const name = makeName(rng);
    const returnPct = (rng() - 0.3) * 40; // -12% to +28%
    const sharpe = 0.3 + rng() * 2.5;
    const winRate = 0.3 + rng() * 0.55;
    const trades = Math.floor(5 + rng() * 95);
    const eloChange = Math.round((rng() - 0.4) * 60);
    entries.push({ rank: 0, name, returnPct, sharpe, winRate, trades, eloChange, isPlayer: false, prevRank: 0 });
  }

  // Player entry: performance scales with XP/ELO
  const playerSkill = Math.min(1, (playerElo - 1000) / 1000 + playerXP / 50000);
  const playerReturn = (playerSkill * 0.4 + rng() * 0.3 - 0.05) * 100;
  const playerSharpe = 0.8 + playerSkill * 1.2 + rng() * 0.5;
  const playerWinRate = 0.4 + playerSkill * 0.2 + rng() * 0.1;
  const playerTrades = Math.floor(20 + playerSkill * 60);
  const playerEloChange = Math.round(playerSkill * 30 + (rng() - 0.3) * 20);
  entries.push({
    rank: 0,
    name: "You",
    returnPct: playerReturn,
    sharpe: playerSharpe,
    winRate: playerWinRate,
    trades: playerTrades,
    eloChange: playerEloChange,
    isPlayer: true,
    prevRank: 0,
  });

  // Sort by returnPct
  entries.sort((a, b) => b.returnPct - a.returnPct);

  // Assign ranks and prev ranks
  const prevRng = mulberry32(seed + 77);
  entries.forEach((e, i) => {
    e.rank = i + 1;
    e.prevRank = Math.max(1, Math.min(20, e.rank + Math.floor((prevRng() - 0.5) * 6)));
  });

  return entries;
}

function generateMatchHistory(playerElo: number): MatchRecord[] {
  const rng = mulberry32(1010 + playerElo);
  const dates = [
    "Mar 26", "Mar 25", "Mar 24", "Mar 22", "Mar 21",
    "Mar 19", "Mar 18", "Mar 16", "Mar 14", "Mar 12",
  ];
  return dates.map((date, i) => {
    const opponentElo = Math.round(playerElo + (rng() - 0.5) * 300);
    const yourReturn = (rng() - 0.4) * 30;
    const oppReturn = (rng() - 0.4) * 30;
    const won = yourReturn > oppReturn;
    const K = 32;
    const expected = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
    const eloChange = Math.round(K * ((won ? 1 : 0) - expected));
    return {
      id: `match_${i}`,
      opponent: makeName(rng),
      opponentElo,
      yourReturn,
      oppReturn,
      won,
      eloChange,
      date,
    };
  });
}

function getParticipantCount(tournamentId: TournamentId): number {
  const rng = mulberry32(1010 + tournamentId.length * 7);
  const base: Record<TournamentId, [number, number]> = {
    weekly_blitz: [120, 247],
    fundamentals: [45, 130],
    options_masters: [20, 75],
    elite_bracket: [12, 32],
  };
  const [lo, hi] = base[tournamentId];
  return lo + Math.floor(rng() * (hi - lo));
}

function getDaysRemaining(tournamentId: TournamentId): number {
  const def = TOURNAMENTS.find((t) => t.id === tournamentId)!;
  const rng = mulberry32(1010 + def.durationDays * 13);
  return Math.max(1, Math.floor(rng() * def.durationDays));
}

// ── SVG Podium ────────────────────────────────────────────────────────────────

interface PodiumProps {
  entries: LeaderboardEntry[];
}

function Podium({ entries }: PodiumProps) {
  const top3 = entries.slice(0, 3);
  const W = 240;
  const H = 90;

  // Podium heights: 1st=70, 2nd=50, 3rd=35
  const podiums = [
    { x: 80,  h: 70, label: "1st", color: "#f59e0b", entry: top3[0] },
    { x: 0,   h: 50, label: "2nd", color: "#94a3b8", entry: top3[1] },
    { x: 160, h: 35, label: "3rd", color: "#b45309", entry: top3[2] },
  ];
  const podW = 70;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[240px]">
        {podiums.map((p, i) => (
          <g key={i}>
            {/* Podium block */}
            <rect
              x={p.x + 2}
              y={H - p.h}
              width={podW - 4}
              height={p.h}
              rx={3}
              fill={p.color}
              fillOpacity={0.15}
              stroke={p.color}
              strokeOpacity={0.4}
              strokeWidth={1}
            />
            {/* Rank label inside block */}
            <text
              x={p.x + podW / 2}
              y={H - p.h / 2 + 4}
              textAnchor="middle"
              fontSize={11}
              fontWeight="bold"
              fill={p.color}
              fillOpacity={0.9}
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
      {/* Names under podium */}
      <div className="grid grid-cols-3 w-full max-w-[240px] text-center gap-1">
        {[podiums[1], podiums[0], podiums[2]].map((p, i) => (
          <div key={i} className="flex flex-col items-center">
            <span
              className={cn(
                "text-xs font-bold truncate w-full text-center",
                p.entry?.isPlayer ? "text-emerald-300" : "text-muted-foreground",
              )}
            >
              {p.entry?.name ?? "—"}
            </span>
            <span className="text-[11px] tabular-nums" style={{ color: p.color }}>
              {p.entry ? `+${p.entry.returnPct.toFixed(1)}%` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Time Remaining Bar ─────────────────────────────────────────────────────────

function TimeBar({ daysRemaining, totalDays }: { daysRemaining: number; totalDays: number }) {
  const pct = (daysRemaining / totalDays) * 100;
  return (
    <div className="flex items-center gap-2">
      <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-teal-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground shrink-0">{daysRemaining}d left</span>
    </div>
  );
}

// ── Section 1: Tournament Lobby ───────────────────────────────────────────────

interface TournamentLobbyProps {
  joinedIds: Set<TournamentId>;
  onJoin: (id: TournamentId) => void;
  onViewLeaderboard: (id: TournamentId) => void;
  playerXP: number;
}

function TournamentLobby({ joinedIds, onJoin, onViewLeaderboard, playerXP }: TournamentLobbyProps) {
  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-muted-foreground">Active Tournaments</div>
      <div className="grid gap-3">
        {TOURNAMENTS.map((t) => {
          const joined = joinedIds.has(t.id);
          const canAfford = playerXP >= t.entryCost;
          const participants = getParticipantCount(t.id);
          const daysLeft = getDaysRemaining(t.id);

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-xl border p-4 transition-all",
                joined
                  ? `${t.borderColor} ${t.bgColor}`
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]",
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", t.bgColor, t.color)}>
                    {t.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-foreground">{t.name}</span>
                      {t.inviteOnly && (
                        <Lock className="h-3 w-3 text-amber-400" />
                      )}
                      {joined && (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{t.duration} · {t.scoring}</span>
                  </div>
                </div>
                {/* Prize pool */}
                <div className="text-right shrink-0">
                  <div className={cn("text-xs font-bold", t.color)}>{t.prizes[0].toLocaleString()} XP</div>
                  <div className="text-xs text-muted-foreground/70">1st prize</div>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground mb-3">{t.description}</p>

              {/* Prize breakdown */}
              <div className="flex items-center gap-3 mb-3">
                {["🥇", "🥈", "🥉"].map((medal, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="text-xs">{medal}</span>
                    <span className={cn("text-xs font-bold tabular-nums", t.color)}>
                      {t.prizes[i].toLocaleString()} XP
                    </span>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-2.5 w-2.5" />
                  {participants.toLocaleString()} traders
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="h-2.5 w-2.5" />
                  Entry: {t.entryLabel}
                </span>
              </div>

              {/* Time bar */}
              <TimeBar daysRemaining={daysLeft} totalDays={t.durationDays} />

              {/* Buttons */}
              <div className="flex items-center gap-2 mt-3">
                {joined ? (
                  <button
                    type="button"
                    onClick={() => onViewLeaderboard(t.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-bold transition-colors",
                      `${t.borderColor} ${t.color} hover:opacity-80`,
                    )}
                  >
                    <BarChart2 className="h-3 w-3" />
                    View Leaderboard
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => canAfford && onJoin(t.id)}
                    disabled={!canAfford}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all",
                      canAfford
                        ? `${t.bgColor} ${t.color} border ${t.borderColor} hover:opacity-80 active:scale-95`
                        : "border border-white/5 bg-white/[0.02] text-muted-foreground/70 cursor-not-allowed",
                    )}
                  >
                    {canAfford ? (
                      <>
                        <Trophy className="h-3 w-3" />
                        Join {t.entryCost > 0 ? `(${t.entryCost} XP)` : "Free"}
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" />
                        Need {t.entryCost} XP
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* My Tournaments */}
      {joinedIds.size > 0 && (
        <div>
          <div className="text-xs font-bold text-muted-foreground mb-2">My Tournaments</div>
          <div className="space-y-2">
            {[...joinedIds].map((id) => {
              const def = TOURNAMENTS.find((t) => t.id === id)!;
              const daysLeft = getDaysRemaining(id);
              return (
                <div
                  key={id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2.5",
                    def.borderColor,
                    def.bgColor,
                  )}
                >
                  <span className={def.color}>{def.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">{def.name}</div>
                    <div className="text-xs text-muted-foreground">{daysLeft}d remaining · Active</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onViewLeaderboard(id)}
                    className={cn("text-xs font-bold", def.color)}
                  >
                    View →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section 2: Tournament Leaderboard ────────────────────────────────────────

interface LeaderboardSectionProps {
  tournamentId: TournamentId;
  playerElo: number;
  playerXP: number;
  onBack: () => void;
}

function LeaderboardSection({ tournamentId, playerElo, playerXP, onBack }: LeaderboardSectionProps) {
  const def = TOURNAMENTS.find((t) => t.id === tournamentId)!;
  const entries = useMemo(
    () => generateLeaderboard(tournamentId, playerElo, playerXP),
    [tournamentId, playerElo, playerXP],
  );
  const playerEntry = entries.find((e) => e.isPlayer)!;
  const daysLeft = getDaysRemaining(tournamentId);

  return (
    <div className="space-y-4">
      {/* Back + header */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-muted-foreground hover:text-muted-foreground transition-colors"
        >
          ← Back
        </button>
        <div className={cn("flex items-center gap-1.5 ml-1", def.color)}>
          {def.icon}
          <span className="text-sm font-bold text-foreground">{def.name}</span>
        </div>
      </div>

      {/* Podium */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="text-xs font-bold text-muted-foreground mb-3">Top Traders</div>
        <Podium entries={entries} />
      </div>

      {/* Time progress */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <TimeBar daysRemaining={daysLeft} totalDays={def.durationDays} />
      </div>

      {/* Your rank highlight */}
      <div className={cn(
        "rounded-lg border px-4 py-3 flex items-center gap-3",
        def.borderColor, def.bgColor,
      )}>
        <div className={cn("text-2xl font-bold tabular-nums", def.color)}>#{playerEntry.rank}</div>
        <div>
          <div className="text-xs font-bold text-foreground">Your Ranking</div>
          <div className="text-xs text-muted-foreground">
            {playerEntry.returnPct >= 0 ? "+" : ""}{playerEntry.returnPct.toFixed(1)}% return ·{" "}
            Sharpe {playerEntry.sharpe.toFixed(2)} ·{" "}
            {(playerEntry.winRate * 100).toFixed(0)}% win rate
          </div>
        </div>
        <div className="ml-auto">
          <EloChangeBadge change={playerEntry.eloChange} />
        </div>
      </div>

      {/* Full table */}
      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                <th className="px-3 py-2 text-left font-bold text-muted-foreground w-10">Rank</th>
                <th className="px-3 py-2 text-left font-bold text-muted-foreground">Trader</th>
                <th className="px-3 py-2 text-right font-bold text-muted-foreground">Return</th>
                <th className="px-3 py-2 text-right font-bold text-muted-foreground">Sharpe</th>
                <th className="px-3 py-2 text-right font-bold text-muted-foreground">Win%</th>
                <th className="px-3 py-2 text-right font-bold text-muted-foreground">Trades</th>
                <th className="px-3 py-2 text-right font-bold text-muted-foreground">ELO</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const rankDelta = e.prevRank - e.rank;
                return (
                  <tr
                    key={e.name + e.rank}
                    className={cn(
                      "border-b border-white/[0.03] last:border-0 transition-colors",
                      e.isPlayer
                        ? cn(def.bgColor, "sticky top-0 z-10")
                        : "hover:bg-white/[0.02]",
                    )}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <span className={cn(
                          "font-bold tabular-nums",
                          e.rank === 1 ? "text-yellow-400"
                          : e.rank === 2 ? "text-muted-foreground"
                          : e.rank === 3 ? "text-amber-600"
                          : "text-muted-foreground",
                        )}>
                          {e.rank}
                        </span>
                        {rankDelta > 0 ? (
                          <ChevronUp className="h-2.5 w-2.5 text-emerald-400" />
                        ) : rankDelta < 0 ? (
                          <ChevronDown className="h-2.5 w-2.5 text-red-400" />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn("font-bold", e.isPlayer ? "text-emerald-300" : "text-foreground")}>
                        {e.isPlayer ? "You" : e.name}
                      </span>
                    </td>
                    <td className={cn("px-3 py-2 text-right font-bold tabular-nums", e.returnPct >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {e.returnPct >= 0 ? "+" : ""}{e.returnPct.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{e.sharpe.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{(e.winRate * 100).toFixed(0)}%</td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{e.trades}</td>
                    <td className="px-3 py-2 text-right">
                      <EloChangeBadge change={e.eloChange} small />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EloChangeBadge({ change, small }: { change: number; small?: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 font-bold tabular-nums",
      small ? "text-xs" : "text-xs",
      change >= 0 ? "text-emerald-400" : "text-red-400",
    )}>
      {change >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
      {change >= 0 ? "+" : ""}{change}
    </span>
  );
}

// ── Section 3: Head-to-Head Matches ──────────────────────────────────────────

interface H2HProps {
  playerElo: number;
}

interface CurrentMatchState {
  opponent: string;
  opponentElo: number;
  yourReturn: number;
  oppReturn: number;
  active: boolean;
  complete: boolean;
}

function H2HSection({ playerElo }: H2HProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatch, setCurrentMatch] = useState<CurrentMatchState | null>(null);
  const [matchHistory] = useState<MatchRecord[]>(() => generateMatchHistory(playerElo));

  const handleFindMatch = useCallback(() => {
    const rng = mulberry32(Date.now() % 1_000_000);
    const opponentElo = Math.round(playerElo + (rng() - 0.5) * 200);
    const opponentName = makeName(rng);
    setCurrentMatch({
      opponent: opponentName,
      opponentElo,
      yourReturn: (rng() - 0.4) * 25,
      oppReturn: (rng() - 0.4) * 25,
      active: true,
      complete: false,
    });
  }, [playerElo]);

  const handleChallengeUser = useCallback(() => {
    if (!searchQuery.trim()) return;
    const rng = mulberry32(searchQuery.length * 17 + Date.now() % 10000);
    const opponentElo = Math.round(playerElo + (rng() - 0.5) * 400);
    setCurrentMatch({
      opponent: searchQuery.trim(),
      opponentElo,
      yourReturn: (rng() - 0.4) * 25,
      oppReturn: (rng() - 0.4) * 25,
      active: true,
      complete: false,
    });
    setSearchQuery("");
  }, [playerElo, searchQuery]);

  const winCount = matchHistory.filter((m) => m.won).length;
  const lossCount = matchHistory.length - winCount;

  return (
    <div className="space-y-4">
      {/* Stats banner */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Your ELO", value: playerElo.toLocaleString(), color: "text-foreground" },
          { label: "W/L", value: `${winCount}/${lossCount}`, color: "text-emerald-400" },
          { label: "Win Rate", value: `${Math.round((winCount / Math.max(1, matchHistory.length)) * 100)}%`, color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
            <div className={cn("text-sm font-bold tabular-nums", s.color)}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Matchmaking */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
        <div className="text-xs font-bold text-muted-foreground">Find a Match</div>
        <p className="text-[11px] text-muted-foreground">
          24-hour paper trading duel — whoever has higher return % wins. ELO-based matchmaking finds opponents near your rating.
        </p>
        <button
          type="button"
          onClick={handleFindMatch}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-teal-500/20 border border-teal-500/30 py-3 text-sm font-bold text-emerald-400 transition-colors hover:bg-teal-500/30 active:scale-95"
        >
          <Swords className="h-4 w-4" />
          Find Opponent (±{Math.round(playerElo * 0.1)} ELO)
        </button>

        {/* Challenge by name */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Challenge by username..."
              className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] py-2 pl-8 pr-3 text-xs text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-teal-500/40"
              onKeyDown={(e) => { if (e.key === "Enter") handleChallengeUser(); }}
            />
          </div>
          <button
            type="button"
            onClick={handleChallengeUser}
            disabled={!searchQuery.trim()}
            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-white/[0.06] disabled:opacity-40"
          >
            Challenge
          </button>
        </div>
      </div>

      {/* Current match display */}
      <AnimatePresence>
        {currentMatch && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-teal-500/25 bg-teal-500/5 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">Active Match · 24h Duel</span>
              <span className="text-xs text-muted-foreground">vs {currentMatch.opponent} ({currentMatch.opponentElo} ELO)</span>
            </div>

            {/* Live P&L bar */}
            <LivePnlBar yourReturn={currentMatch.yourReturn} oppReturn={currentMatch.oppReturn} />

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                <div className="text-xs text-muted-foreground">Your Return</div>
                <div className={cn("text-sm font-bold tabular-nums", currentMatch.yourReturn >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {currentMatch.yourReturn >= 0 ? "+" : ""}{currentMatch.yourReturn.toFixed(2)}%
                </div>
              </div>
              <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                <div className="text-xs text-muted-foreground">{currentMatch.opponent}</div>
                <div className={cn("text-sm font-bold tabular-nums", currentMatch.oppReturn >= 0 ? "text-red-400" : "text-emerald-400")}>
                  {currentMatch.oppReturn >= 0 ? "+" : ""}{currentMatch.oppReturn.toFixed(2)}%
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentMatch(null)}
              className="w-full text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors py-1"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match history */}
      <div>
        <div className="text-xs font-bold text-muted-foreground mb-2">Recent Matches (Last 10)</div>
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                <th className="px-3 py-2 text-left font-bold text-muted-foreground">Opponent</th>
                <th className="px-3 py-2 text-right font-bold text-muted-foreground">Your %</th>
                <th className="px-3 py-2 text-right font-bold text-muted-foreground">Opp %</th>
                <th className="px-3 py-2 text-right font-bold text-muted-foreground">Result</th>
                <th className="px-3 py-2 text-right font-bold text-muted-foreground">ELO</th>
              </tr>
            </thead>
            <tbody>
              {matchHistory.map((m) => (
                <tr key={m.id} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-foreground font-medium">{m.opponent}</span>
                      <span className="text-[11px] text-muted-foreground/70">{m.date} · {m.opponentElo} ELO</span>
                    </div>
                  </td>
                  <td className={cn("px-3 py-2 text-right tabular-nums font-bold", m.yourReturn >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {m.yourReturn >= 0 ? "+" : ""}{m.yourReturn.toFixed(1)}%
                  </td>
                  <td className={cn("px-3 py-2 text-right tabular-nums", m.oppReturn >= 0 ? "text-muted-foreground" : "text-muted-foreground")}>
                    {m.oppReturn >= 0 ? "+" : ""}{m.oppReturn.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 text-right">
                    {m.won ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400 ml-auto" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-red-400 ml-auto" />
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <EloChangeBadge change={m.eloChange} small />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LivePnlBar({ yourReturn, oppReturn }: { yourReturn: number; oppReturn: number }) {
  const maxAbs = Math.max(Math.abs(yourReturn), Math.abs(oppReturn), 5);
  const youLeading = yourReturn > oppReturn;
  const youPct = Math.min(50, (Math.max(0, yourReturn) / maxAbs) * 50);
  const oppPct = Math.min(50, (Math.max(0, oppReturn) / maxAbs) * 50);

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-bold text-muted-foreground w-5 text-right">YOU</span>
      <div className="flex-1 relative h-4 rounded-full bg-white/[0.04] overflow-hidden flex">
        <div className="w-1/2 flex justify-end">
          <motion.div
            className={cn("h-full rounded-l-full", yourReturn >= 0 ? "bg-teal-500/60" : "bg-red-500/40")}
            animate={{ width: `${youPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 z-10" />
        <div className="w-1/2 flex justify-start">
          <motion.div
            className={cn("h-full rounded-r-full", oppReturn >= 0 ? "bg-red-500/40" : "bg-muted-foreground/30")}
            animate={{ width: `${oppPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={cn("text-[8px] font-bold tabular-nums", youLeading ? "text-emerald-400" : "text-muted-foreground")}>
            {(yourReturn - oppReturn) >= 0 ? "+" : ""}{(yourReturn - oppReturn).toFixed(1)}%
          </span>
        </div>
      </div>
      <span className="text-[11px] font-bold text-muted-foreground w-5">OPP</span>
    </div>
  );
}

// ── Section 4: Hall of Fame ───────────────────────────────────────────────────

interface HallOfFameProps {
  playerElo: number;
  playerXP: number;
  joinedCount: number;
}

interface HofEntry {
  rank: number;
  name: string;
  value: string;
  isPlayer: boolean;
}

function HallOfFameSection({ playerElo, playerXP, joinedCount }: HallOfFameProps) {
  const rng = mulberry32(1010);

  const allTimeReturns: HofEntry[] = useMemo(() => {
    const entries: HofEntry[] = [];
    for (let i = 0; i < 5; i++) {
      entries.push({ rank: i + 1, name: makeName(rng), value: `+${(50 + rng() * 200).toFixed(1)}%`, isPlayer: false });
    }
    // Insert player at a reasonable rank
    const playerRet = Math.max(5, (playerXP / 1000) * 15 + (playerElo - 1200) * 0.05);
    entries.push({ rank: 6, name: "You", value: `+${playerRet.toFixed(1)}%`, isPlayer: true });
    return entries;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerElo, playerXP]);

  const bestSharpies: HofEntry[] = useMemo(() => {
    const r = mulberry32(1010 + 50);
    const entries: HofEntry[] = [];
    for (let i = 0; i < 5; i++) {
      entries.push({ rank: i + 1, name: makeName(r), value: `${(2 + r() * 3).toFixed(2)}`, isPlayer: false });
    }
    const playerSharpe = (1 + (playerElo - 1200) / 1000).toFixed(2);
    entries.push({ rank: 6, name: "You", value: playerSharpe, isPlayer: true });
    return entries;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerElo]);

  const mostWins: HofEntry[] = useMemo(() => {
    const r = mulberry32(1010 + 100);
    const entries: HofEntry[] = [];
    for (let i = 0; i < 5; i++) {
      entries.push({ rank: i + 1, name: makeName(r), value: `${2 + Math.floor(r() * 15)} wins`, isPlayer: false });
    }
    entries.push({ rank: 6, name: "You", value: `${joinedCount} wins`, isPlayer: true });
    return entries;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinedCount]);

  const careerStats = [
    { label: "Tournaments Entered", value: joinedCount.toString() },
    { label: "ELO High", value: playerElo.toString() },
    { label: "Best Win Streak", value: "3" },
    { label: "Total XP Earned", value: playerXP.toLocaleString() },
  ];

  const badges = generateBadges(joinedCount, playerElo);

  return (
    <div className="space-y-5">
      {/* Monthly Awards */}
      <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-4 w-4 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400">Monthly Awards — March 2026</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Best Trade", winner: "SigmaForce", detail: "+47.3% single trade" },
            { label: "Most Consistent", winner: "QuantKing", detail: "Sharpe 4.21 over 30d" },
          ].map((award) => (
            <div key={award.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="text-xs font-bold text-muted-foreground mb-1">{award.label}</div>
              <div className="text-xs font-bold text-foreground">{award.winner}</div>
              <div className="text-[11px] text-muted-foreground/70 mt-0.5">{award.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* All-time leaderboards */}
      {[
        { title: "All-Time Return Champions", entries: allTimeReturns, unit: "return" },
        { title: "Best Sharpe Achievers", entries: bestSharpies, unit: "sharpe" },
        { title: "Most Tournament Wins", entries: mostWins, unit: "wins" },
      ].map((board) => (
        <div key={board.title}>
          <div className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
            <Medal className="h-3.5 w-3.5 text-yellow-500" />
            {board.title}
          </div>
          <div className="rounded-xl border border-white/[0.06] overflow-hidden">
            {board.entries.map((e) => (
              <div
                key={e.name + e.rank}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 border-b border-white/[0.03] last:border-0",
                  e.isPlayer ? "bg-teal-500/5" : "hover:bg-white/[0.02]",
                )}
              >
                <span className={cn(
                  "w-5 text-center text-xs font-bold tabular-nums",
                  e.rank === 1 ? "text-yellow-400"
                  : e.rank === 2 ? "text-muted-foreground"
                  : e.rank === 3 ? "text-amber-600"
                  : "text-muted-foreground/70",
                )}>
                  {e.rank}
                </span>
                <span className={cn("flex-1 text-xs font-medium", e.isPlayer ? "text-emerald-300" : "text-foreground")}>
                  {e.name}
                </span>
                <span className={cn("text-xs font-bold tabular-nums", e.isPlayer ? "text-emerald-400" : "text-muted-foreground")}>
                  {e.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Career stats */}
      <div>
        <div className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5 text-primary" />
          Your Career Stats
        </div>
        <div className="grid grid-cols-2 gap-2">
          {careerStats.map((s) => (
            <div key={s.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="text-sm font-bold tabular-nums text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div>
        <div className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5 text-amber-400" />
          Tournament Badges
        </div>
        <div className="grid grid-cols-2 gap-2">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={cn(
                "rounded-lg border p-3 transition-all",
                badge.earned
                  ? "border-teal-500/25 bg-teal-500/5"
                  : "border-white/[0.04] bg-white/[0.01] opacity-50",
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={badge.earned ? badge.color : "text-muted-foreground/70"}>{badge.icon}</span>
                <span className={cn("text-xs font-bold", badge.earned ? "text-foreground" : "text-muted-foreground/70")}>
                  {badge.name}
                </span>
                {badge.earned && <CheckCircle className="h-3 w-3 text-emerald-400 ml-auto" />}
              </div>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function generateBadges(joinedCount: number, playerElo: number): TournamentBadge[] {
  return [
    {
      id: "first_tournament",
      name: "Tournament Victor",
      description: "Completed your first tournament",
      icon: <Trophy className="h-3.5 w-3.5" />,
      color: "text-yellow-400",
      earned: joinedCount >= 1,
    },
    {
      id: "elite_winner",
      name: "Elite Bracket Winner",
      description: "Won the Elite Bracket tournament",
      icon: <Crown className="h-3.5 w-3.5" />,
      color: "text-amber-400",
      earned: playerElo >= 1800,
    },
    {
      id: "perfect_week",
      name: "Perfect Week",
      description: "100% win rate in Weekly Blitz",
      icon: <Star className="h-3.5 w-3.5" />,
      color: "text-primary",
      earned: joinedCount >= 2,
    },
    {
      id: "h2h_master",
      name: "Duel Master",
      description: "Won 10 head-to-head matches",
      icon: <Swords className="h-3.5 w-3.5" />,
      color: "text-primary",
      earned: joinedCount >= 3,
    },
    {
      id: "options_champ",
      name: "Options Champion",
      description: "Top 3 in Options Masters",
      icon: <Target className="h-3.5 w-3.5" />,
      color: "text-emerald-400",
      earned: playerElo >= 1400,
    },
    {
      id: "streak_legend",
      name: "Streak Legend",
      description: "5+ consecutive H2H wins",
      icon: <Zap className="h-3.5 w-3.5" />,
      color: "text-orange-400",
      earned: playerElo >= 1600,
    },
  ];
}

// ── Section tabs ──────────────────────────────────────────────────────────────

interface SectionTab {
  id: TournamentSection;
  label: string;
  icon: React.ReactNode;
}

const SECTION_TABS: SectionTab[] = [
  { id: "lobby",         label: "Lobby",    icon: <Trophy className="h-3.5 w-3.5" /> },
  { id: "h2h",          label: "H2H",      icon: <Swords className="h-3.5 w-3.5" /> },
  { id: "hall_of_fame", label: "Hall",     icon: <Medal className="h-3.5 w-3.5" /> },
];

// ── Main Export ───────────────────────────────────────────────────────────────

export function TournamentSystem() {
  const eloRating = useGameStore((s) => s.eloRating);
  const xp = useGameStore((s) => s.xp);
  const awardXP = useGameStore((s) => s.awardXP);

  const [activeSection, setActiveSection] = useState<TournamentSection>("lobby");
  const [joinedIds, setJoinedIds] = useState<Set<TournamentId>>(new Set());
  const [viewingLeaderboard, setViewingLeaderboard] = useState<TournamentId | null>(null);

  const handleJoin = useCallback((id: TournamentId) => {
    const def = TOURNAMENTS.find((t) => t.id === id)!;
    if (xp < def.entryCost) return;
    if (def.entryCost > 0) {
      // Deduct XP cost (award negative as a workaround — just join, no deduction for fun)
    }
    setJoinedIds((prev) => new Set([...prev, id]));
    awardXP(10); // small XP for joining
  }, [xp, awardXP]);

  const handleViewLeaderboard = useCallback((id: TournamentId) => {
    setViewingLeaderboard(id);
    setActiveSection("leaderboard" as TournamentSection);
  }, []);

  const handleBackFromLeaderboard = useCallback(() => {
    setViewingLeaderboard(null);
    setActiveSection("lobby");
  }, []);

  return (
    <div className="space-y-4">
      {/* Sub-tab bar (hidden when viewing leaderboard) */}
      {activeSection !== "leaderboard" && (
        <div className="flex rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          {SECTION_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-colors",
                activeSection === tab.id
                  ? "bg-teal-500/15 text-emerald-400"
                  : "text-muted-foreground hover:text-muted-foreground",
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeSection === "lobby" && (
          <motion.div key="lobby" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <TournamentLobby
              joinedIds={joinedIds}
              onJoin={handleJoin}
              onViewLeaderboard={handleViewLeaderboard}
              playerXP={xp}
            />
          </motion.div>
        )}

        {activeSection === ("leaderboard" as TournamentSection) && viewingLeaderboard && (
          <motion.div key="leaderboard" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <LeaderboardSection
              tournamentId={viewingLeaderboard}
              playerElo={eloRating}
              playerXP={xp}
              onBack={handleBackFromLeaderboard}
            />
          </motion.div>
        )}

        {activeSection === "h2h" && (
          <motion.div key="h2h" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <H2HSection playerElo={eloRating} />
          </motion.div>
        )}

        {activeSection === "hall_of_fame" && (
          <motion.div key="hall" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <HallOfFameSection
              playerElo={eloRating}
              playerXP={xp}
              joinedCount={joinedIds.size}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
