"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Trophy, Calendar, Users, Star, ChevronRight, TrendingUp, TrendingDown,
} from "lucide-react";
import { useGameStore } from "@/stores/game-store";

// ── Seeded PRNG ──────────────────────────────────────────────────

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ── ELO Tier helpers ─────────────────────────────────────────────

type EloTier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";

function getEloTier(elo: number): EloTier {
  if (elo >= 1800) return "Diamond";
  if (elo >= 1600) return "Platinum";
  if (elo >= 1400) return "Gold";
  if (elo >= 1200) return "Silver";
  return "Bronze";
}

const TIER_COLORS: Record<EloTier, string> = {
  Bronze:   "text-amber-600",
  Silver:   "text-zinc-400",
  Gold:     "text-yellow-400",
  Platinum: "text-cyan-300",
  Diamond:  "text-blue-400",
};

const TIER_BG: Record<EloTier, string> = {
  Bronze:   "bg-amber-600/15 border-amber-600/30",
  Silver:   "bg-zinc-400/10 border-zinc-400/20",
  Gold:     "bg-yellow-400/10 border-yellow-400/25",
  Platinum: "bg-cyan-300/10 border-cyan-300/25",
  Diamond:  "bg-blue-400/10 border-blue-400/25",
};

// Win probability: P(win) = 1 / (1 + 10^((oppElo - myElo)/400))
function winProb(myElo: number, oppElo: number): number {
  return 1 / (1 + Math.pow(10, (oppElo - myElo) / 400));
}

// ELO change after match
function calcEloChange(myElo: number, oppElo: number, won: boolean): number {
  const K = 32;
  const expected = winProb(myElo, oppElo);
  const actual = won ? 1 : 0;
  return Math.round(K * (actual - expected));
}

// ── NPC pool ─────────────────────────────────────────────────────

const NPC_NAMES = [
  "AlphaWolf",    "ByteTrader",  "QuantKing",   "NightOwl",
  "GridRipper",   "IronHands",   "BullRunner",  "StopHunter",
];

interface TournamentPlayer {
  id: string;
  name: string;
  elo: number;
  isPlayer: boolean;
}

function generateBracketPlayers(playerElo: number, seed: number): TournamentPlayer[] {
  const rng = seededRng(seed);
  const npcs: TournamentPlayer[] = NPC_NAMES.map((name, i) => ({
    id: `npc_${i}`,
    name,
    elo: Math.round(1200 + rng() * 800), // 1200–2000
    isPlayer: false,
  }));
  const you: TournamentPlayer = { id: "player", name: "You", elo: playerElo, isPlayer: true };
  // Shuffle deterministically
  const all = [you, ...npcs];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, 8);
}

// Simulate a match result seeded on the two player ids + round seed
function simulateMatch(
  a: TournamentPlayer,
  b: TournamentPlayer,
  roundSeed: number,
  forcePlayerWin?: boolean,
): TournamentPlayer {
  if (forcePlayerWin !== undefined && (a.isPlayer || b.isPlayer)) {
    return forcePlayerWin ? (a.isPlayer ? a : b) : (a.isPlayer ? b : a);
  }
  const rng = seededRng(roundSeed);
  const prob = winProb(a.elo, b.elo);
  return rng() < prob ? a : b;
}

// ── Bracket types ────────────────────────────────────────────────

type RoundName = "Quarterfinals" | "Semifinals" | "Finals";

interface BracketMatch {
  id: string;
  round: RoundName;
  playerA: TournamentPlayer | null;
  playerB: TournamentPlayer | null;
  winner: TournamentPlayer | null;
}

interface BracketState {
  qf: BracketMatch[];   // 4 matches
  sf: BracketMatch[];   // 2 matches
  final: BracketMatch;  // 1 match
}

function buildBracket(players: TournamentPlayer[], seed: number): BracketState {
  // QF
  const qf: BracketMatch[] = [0, 1, 2, 3].map((i) => ({
    id: `qf_${i}`,
    round: "Quarterfinals",
    playerA: players[i * 2],
    playerB: players[i * 2 + 1],
    winner: simulateMatch(players[i * 2], players[i * 2 + 1], seed + i),
  }));

  // SF
  const sf: BracketMatch[] = [0, 1].map((i) => ({
    id: `sf_${i}`,
    round: "Semifinals",
    playerA: qf[i * 2].winner,
    playerB: qf[i * 2 + 1].winner,
    winner: simulateMatch(
      qf[i * 2].winner!,
      qf[i * 2 + 1].winner!,
      seed + 100 + i,
    ),
  }));

  const final: BracketMatch = {
    id: "final",
    round: "Finals",
    playerA: sf[0].winner,
    playerB: sf[1].winner,
    winner: simulateMatch(sf[0].winner!, sf[1].winner!, seed + 200),
  };

  return { qf, sf, final };
}

// ── ELO History SVG Chart ─────────────────────────────────────────

function EloHistoryChart({ history }: { history: number[] }) {
  const W = 240;
  const H = 60;
  const pts = history.slice(-10);
  if (pts.length < 2) return null;

  const minV = Math.min(...pts) - 20;
  const maxV = Math.max(...pts) + 20;
  const range = maxV - minV || 1;

  const toX = (i: number) => (i / (pts.length - 1)) * W;
  const toY = (v: number) => H - ((v - minV) / range) * H;

  const polyline = pts.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const latest = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const up = latest >= prev;

  return (
    <svg width={W} height={H} className="w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {/* Fill area */}
      <polyline
        points={`0,${H} ${polyline} ${toX(pts.length - 1)},${H}`}
        fill={up ? "rgba(20,184,166,0.08)" : "rgba(239,68,68,0.08)"}
        stroke="none"
      />
      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke={up ? "#14b8a6" : "#ef4444"}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Dots */}
      {pts.map((v, i) => (
        <circle
          key={i}
          cx={toX(i)}
          cy={toY(v)}
          r={i === pts.length - 1 ? 3 : 1.5}
          fill={up ? "#14b8a6" : "#ef4444"}
          fillOpacity={i === pts.length - 1 ? 1 : 0.5}
        />
      ))}
    </svg>
  );
}

// ── Match Card (bracket cell) ─────────────────────────────────────

function MatchCard({ match }: { match: BracketMatch }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden text-[11px]">
      {[match.playerA, match.playerB].map((p, idx) => {
        if (!p) return <div key={idx} className="px-2.5 py-1.5 text-zinc-700">TBD</div>;
        const isWinner = match.winner?.id === p.id;
        const tier = getEloTier(p.elo);
        return (
          <div
            key={p.id}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 transition-colors",
              idx === 0 && "border-b border-white/[0.04]",
              isWinner && match.winner !== null && "bg-teal-500/10",
              p.isPlayer && "ring-inset ring-1 ring-teal-500/30",
            )}
          >
            {isWinner && match.winner !== null && (
              <Star className="h-2.5 w-2.5 text-yellow-400 shrink-0" />
            )}
            <span className={cn("font-bold truncate flex-1", p.isPlayer ? "text-teal-300" : "text-zinc-300")}>
              {p.name}
            </span>
            <span className={cn("tabular-nums shrink-0 font-mono", TIER_COLORS[tier])}>
              {p.elo}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Upcoming tournaments ──────────────────────────────────────────

interface TournamentEvent {
  name: string;
  date: string;
  minLevel: number;
  buyin: number;
  prizePool: number;
}

const UPCOMING: TournamentEvent[] = [
  { name: "Weekly Open",        date: "Mar 29, 2026", minLevel: 1,  buyin: 100,  prizePool: 5000  },
  { name: "Silver Cup",         date: "Apr 5, 2026",  minLevel: 5,  buyin: 500,  prizePool: 15000 },
  { name: "Gold Championship",  date: "Apr 12, 2026", minLevel: 10, buyin: 1000, prizePool: 50000 },
  { name: "Platinum Invitational", date: "Apr 19, 2026", minLevel: 15, buyin: 2500, prizePool: 100000 },
];

// ── Past results ──────────────────────────────────────────────────

interface PastResult {
  name: string;
  placement: number;
  prize: number;
  eloChange: number;
}

// Deterministic fake history seeded on player ELO
function buildPastResults(elo: number): PastResult[] {
  const rng = seededRng(elo * 7 + 42);
  return [
    { name: "Weekly Open",        placement: Math.ceil(rng() * 8), prize: Math.round(rng() * 1500),  eloChange: Math.round((rng() - 0.4) * 40) },
    { name: "Silver Cup",         placement: Math.ceil(rng() * 8), prize: Math.round(rng() * 5000),  eloChange: Math.round((rng() - 0.4) * 40) },
    { name: "Gold Championship",  placement: Math.ceil(rng() * 8), prize: Math.round(rng() * 10000), eloChange: Math.round((rng() - 0.4) * 40) },
    { name: "Weekly Open",        placement: Math.ceil(rng() * 8), prize: Math.round(rng() * 1500),  eloChange: Math.round((rng() - 0.4) * 40) },
    { name: "Silver Cup",         placement: Math.ceil(rng() * 8), prize: Math.round(rng() * 5000),  eloChange: Math.round((rng() - 0.4) * 40) },
  ];
}

const PLACEMENT_LABELS: Record<number, string> = {
  1: "1st", 2: "2nd", 3: "3rd",
};
function placementLabel(n: number) {
  return PLACEMENT_LABELS[n] ?? `${n}th`;
}

// ── Main Component ────────────────────────────────────────────────

export function TournamentTab() {
  const eloRating  = useGameStore((s) => s.eloRating);
  const eloHistory = useGameStore((s) => s.eloHistory);
  const updateELO  = useGameStore((s) => s.updateELO);
  const level      = useGameStore((s) => s.level);

  const [joined, setJoined]           = useState(false);
  const [bracketSeed, setBracketSeed] = useState(0);
  const [players, setPlayers]         = useState<TournamentPlayer[]>([]);
  const [bracket, setBracket]         = useState<BracketState | null>(null);
  const [tournamentDone, setTournamentDone] = useState(false);

  const tier = getEloTier(eloRating);
  const pastResults = useMemo(() => buildPastResults(eloRating), [eloRating]);

  const handleJoin = () => {
    const seed = Date.now() % 100_000;
    setBracketSeed(seed);
    const ps = generateBracketPlayers(eloRating, seed);
    setPlayers(ps);
    const b = buildBracket(ps, seed);
    setBracket(b);
    setJoined(true);
    setTournamentDone(false);

    // Award ELO based on final result
    const playerWon = b.final.winner?.isPlayer ?? false;
    const playerInFinal = b.final.playerA?.isPlayer || b.final.playerB?.isPlayer;
    const playerInSemi  = !playerInFinal && (
      b.sf.some((m) => m.playerA?.isPlayer || m.playerB?.isPlayer)
    );

    let eloChange = 0;
    if (playerWon) eloChange = 40;
    else if (playerInFinal) eloChange = 20;
    else if (playerInSemi) eloChange = 5;
    else eloChange = -8;

    setTimeout(() => {
      setTournamentDone(true);
      updateELO(Math.max(0, eloRating + eloChange));
    }, 600);
  };

  const handleReset = () => {
    setJoined(false);
    setBracket(null);
    setTournamentDone(false);
  };

  return (
    <div className="space-y-5 pb-4">
      {/* ELO Badge + History */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex items-center gap-4">
          <div className={cn("rounded-xl border px-4 py-2 text-center", TIER_BG[tier])}>
            <div className={cn("text-2xl font-bold tabular-nums", TIER_COLORS[tier])}>
              {eloRating}
            </div>
            <div className={cn("text-xs font-bold", TIER_COLORS[tier])}>
              {tier}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-zinc-500 mb-1.5">ELO History (last 10)</div>
            <EloHistoryChart history={eloHistory} />
          </div>
        </div>
      </div>

      {/* Join / Reset button */}
      {!joined ? (
        <button
          type="button"
          onClick={handleJoin}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-teal-500 py-3.5 text-sm font-bold text-white transition-colors hover:bg-teal-400 active:scale-95"
        >
          <Trophy className="h-4 w-4" />
          Join Tournament
        </button>
      ) : (
        <button
          type="button"
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/10"
        >
          New Tournament
        </button>
      )}

      {/* Bracket */}
      <AnimatePresence>
        {joined && bracket && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Result banner */}
            {tournamentDone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "rounded-lg border px-4 py-3 text-center text-sm font-bold",
                  bracket.final.winner?.isPlayer
                    ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-400"
                    : "border-white/10 bg-white/5 text-zinc-400",
                )}
              >
                {bracket.final.winner?.isPlayer
                  ? "CHAMPION! You won the tournament!"
                  : `Tournament complete — Winner: ${bracket.final.winner?.name ?? "TBD"}`}
              </motion.div>
            )}

            {/* Rounds */}
            {(["Quarterfinals", "Semifinals", "Finals"] as RoundName[]).map((round) => {
              const matches =
                round === "Quarterfinals" ? bracket.qf
                : round === "Semifinals"  ? bracket.sf
                : [bracket.final];

              return (
                <div key={round}>
                  <div className="text-[11px] font-bold text-zinc-500 mb-2">
                    {round}
                  </div>
                  <div className={cn(
                    "grid gap-2",
                    round === "Quarterfinals" ? "grid-cols-2" : "grid-cols-1 max-w-xs mx-auto",
                  )}>
                    {matches.map((m) => <MatchCard key={m.id} match={m} />)}
                  </div>
                </div>
              );
            })}

            {/* Win probability for next opponent (QF) */}
            {(() => {
              const myQF = bracket.qf.find(
                (m) => m.playerA?.isPlayer || m.playerB?.isPlayer,
              );
              if (!myQF) return null;
              const opp = myQF.playerA?.isPlayer ? myQF.playerB : myQF.playerA;
              if (!opp) return null;
              const prob = winProb(eloRating, opp.elo);
              return (
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="text-[11px] text-zinc-500 mb-2">Win probability vs QF opponent</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-500 transition-all duration-700"
                        style={{ width: `${prob * 100}%` }}
                      />
                    </div>
                    <span className={cn("text-xs font-bold tabular-nums w-10 text-right", prob >= 0.5 ? "text-teal-400" : "text-red-400")}>
                      {(prob * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs text-zinc-600">vs {opp.name} ({opp.elo})</span>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming Schedule */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Calendar className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-xs font-bold text-zinc-400">Upcoming Tournaments</span>
        </div>
        <div className="space-y-2">
          {UPCOMING.map((ev) => {
            const canEnter = level >= ev.minLevel;
            return (
              <div
                key={ev.name + ev.date}
                className={cn(
                  "rounded-lg border p-3 transition-colors",
                  canEnter
                    ? "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                    : "border-white/[0.03] bg-white/[0.01] opacity-60",
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-zinc-200">{ev.name}</span>
                  <span className="text-xs text-zinc-500">{ev.date}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-0.5">
                    <Users className="h-2.5 w-2.5" /> Lv.{ev.minLevel}+
                  </span>
                  <span>Buy-in: {ev.buyin.toLocaleString()} VC</span>
                  <span className="text-teal-400 font-bold">
                    Prize: {ev.prizePool.toLocaleString()} VC
                  </span>
                  {!canEnter && (
                    <span className="ml-auto text-red-400">Locked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past Results */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Trophy className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-xs font-bold text-zinc-400">Past Results</span>
        </div>
        <div className="rounded-lg border border-white/[0.06] overflow-hidden">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                {["Tournament", "Place", "Prize", "ELO"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-bold text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pastResults.map((r, i) => (
                <tr
                  key={i}
                  className={cn("border-b border-white/[0.03] last:border-0", i % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]")}
                >
                  <td className="px-3 py-2 text-zinc-300 truncate max-w-[100px]">{r.name}</td>
                  <td className="px-3 py-2 font-bold text-zinc-200">{placementLabel(r.placement)}</td>
                  <td className="px-3 py-2 text-teal-400 font-bold tabular-nums">
                    +{r.prize.toLocaleString()}
                  </td>
                  <td className={cn("px-3 py-2 font-bold tabular-nums flex items-center gap-1", r.eloChange >= 0 ? "text-teal-400" : "text-red-400")}>
                    {r.eloChange >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {r.eloChange >= 0 ? "+" : ""}{r.eloChange}
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
