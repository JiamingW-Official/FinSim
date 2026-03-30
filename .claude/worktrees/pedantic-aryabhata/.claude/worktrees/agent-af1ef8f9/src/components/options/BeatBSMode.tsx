"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  computeRLPrice,
  type RLPricingEntry,
} from "@/data/rl-pricing-tables";

// ── Black-Scholes approximation ───────────────────────────────────────────────

function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y =
    1 -
    (0.254829592 * t -
      0.284496736 * t * t +
      1.421413741 * t * t * t -
      1.453152027 * t * t * t * t +
      1.061405429 * t * t * t * t * t) *
      Math.exp(-x * x);
  return x < 0 ? -y : y;
}

function N(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

function approxBSCall(S: number, K: number, T: number, sigma: number): number {
  if (T <= 0) return Math.max(0, S - K);
  const d1 =
    (Math.log(S / K) + 0.5 * sigma * sigma * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  return Math.max(0, S * N(d1) - K * Math.exp(-0.05 * T) * N(d2));
}

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

function makePRNG(seed: number) {
  let s = seed;
  return function rand(): number {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Regime = RLPricingEntry["regime"];

interface Round {
  spotPrice: number;
  strike: number;
  daysToExp: number;
  iv: number;
  moneyness: number;
  regime: Regime;
  bsPrice: number;
  rlPrice: number;
  marketPrice: number; // simulated "actual" market price
  rlEdge: number;
  rlConfidence: number;
}

interface RoundResult {
  round: Round;
  playerGuess: number;
  roundScore: number; // 0-100
  winner: "player" | "rl" | "bs"; // closest to market
}

type Phase = "intro" | "guessing" | "reveal" | "summary";

// ── Constants ─────────────────────────────────────────────────────────────────

const TOTAL_ROUNDS = 10;
const LS_KEY_BEST = "finsim_beatbs_best_1000";

const REGIMES: Regime[] = ["trending", "mean-reverting", "volatile", "quiet"];

const REGIME_TOOLTIPS: Record<Regime, string> = {
  trending:
    "BS assumes random walk; RL detects momentum — directional options are often mispriced in trending markets.",
  "mean-reverting":
    "BS overprices long-dated options in range-bound markets; RL corrects for the mean-reversion pull.",
  volatile:
    "BS assumes constant volatility; RL accounts for vol clustering — high-vol periods breed more high-vol.",
  quiet:
    "In compressed-vol regimes, BS slightly overprices options; RL shades prices lower to reflect realized vol.",
};

const MONEYNESS_OPTIONS = [0.90, 0.95, 1.00, 1.05, 1.10];
const EXPIRY_OPTIONS = [7, 14, 30, 60, 90];
const IV_OPTIONS = [0.15, 0.25, 0.35, 0.50];

// ── Score helpers ─────────────────────────────────────────────────────────────

/** Score per spec: 100 - |player_guess - bs_price| * 100, capped [0, 100] */
function computeRoundScore(playerGuess: number, bsPrice: number): number {
  const raw = 100 - Math.abs(playerGuess - bsPrice) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function closestToMarket(
  player: number,
  bs: number,
  rl: number,
  market: number
): "player" | "rl" | "bs" {
  const dPlayer = Math.abs(player - market);
  const dBs = Math.abs(bs - market);
  const dRl = Math.abs(rl - market);
  const best = Math.min(dPlayer, dBs, dRl);
  if (best === dPlayer) return "player";
  if (best === dRl) return "rl";
  return "bs";
}

// ── localStorage helpers ──────────────────────────────────────────────────────

function loadBest(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY_BEST);
    if (raw === null) return null;
    const v = parseInt(raw, 10);
    return isNaN(v) ? null : v;
  } catch {
    return null;
  }
}

function saveBest(score: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY_BEST, String(score));
  } catch {
    /* storage unavailable */
  }
}

// ── Round generator ───────────────────────────────────────────────────────────

function generateRounds(spotPrice: number, iv: number, seed: number): Round[] {
  const rand = makePRNG(seed);
  return Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
    // Pick params
    const moneyness =
      MONEYNESS_OPTIONS[Math.floor(rand() * MONEYNESS_OPTIONS.length)];
    const daysToExp =
      EXPIRY_OPTIONS[Math.floor(rand() * EXPIRY_OPTIONS.length)];
    // Use the live IV ± perturbation to keep variety
    const ivBase = IV_OPTIONS[Math.floor(rand() * IV_OPTIONS.length)];
    const roundIV = Math.max(0.10, Math.min(0.80, ivBase + (rand() - 0.5) * 0.05));
    const regime = REGIMES[Math.floor(rand() * REGIMES.length)];

    // Use spotPrice from props as base; add small per-round jitter so each round feels unique
    const roundSpot = spotPrice * (0.97 + rand() * 0.06);
    const strike = roundSpot * moneyness;
    const T = daysToExp / 365;

    const bsPrice = approxBSCall(roundSpot, strike, T, roundIV);

    const { rlPrice, edge, confidence } = computeRLPrice(
      bsPrice,
      moneyness,
      daysToExp,
      roundIV,
      regime
    );

    // Simulate "actual market price" = RL price ± small noise (±3%)
    const noise = (rand() - 0.5) * 0.06; // ±3%
    const marketPrice = Math.max(0.01, rlPrice * (1 + noise));

    void i; // suppress unused warning
    return {
      spotPrice: roundSpot,
      strike,
      daysToExp,
      iv: roundIV,
      moneyness,
      regime,
      bsPrice,
      rlPrice,
      marketPrice,
      rlEdge: edge,
      rlConfidence: confidence,
    } satisfies Round;
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      {children}
    </span>
  );
}

/** Progress bar showing current round / total */
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <SectionLabel>Round {current} of {total}</SectionLabel>
        <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">
          {pct}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Round dots */}
      <div className="flex gap-1 pt-0.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < current - 1
                ? "bg-green-500"
                : i === current - 1
                ? "bg-primary"
                : "bg-muted/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}

/** Gauge comparing BS / RL / Player / Market on a single number line */
function PriceGaugeSVG({
  bsPrice,
  rlPrice,
  playerGuess,
  marketPrice,
  winner,
}: {
  bsPrice: number;
  rlPrice: number;
  playerGuess: number;
  marketPrice: number;
  winner: "player" | "rl" | "bs";
}) {
  const W = 420;
  const H = 80;
  const PAD = 44;

  const vals = [bsPrice, rlPrice, playerGuess, marketPrice];
  const lo = Math.min(...vals) * 0.88;
  const hi = Math.max(...vals) * 1.12;
  const range = hi - lo || 0.001;

  function xv(v: number): number {
    return PAD + ((v - lo) / range) * (W - PAD * 2);
  }

  const bsX = xv(bsPrice);
  const rlX = xv(rlPrice);
  const pX = xv(playerGuess);
  const mX = xv(marketPrice);

  type Marker = { key: string; x: number; label: string; price: number; color: string; isWinner: boolean; dash?: string };

  const markers: Marker[] = [
    {
      key: "bs",
      x: bsX,
      label: "BS",
      price: bsPrice,
      color: winner === "bs" ? "#22c55e" : "#94a3b8",
      isWinner: winner === "bs",
    },
    {
      key: "rl",
      x: rlX,
      label: "RL",
      price: rlPrice,
      color: winner === "rl" ? "#22c55e" : "#2d9cdb",
      isWinner: winner === "rl",
    },
    {
      key: "you",
      x: pX,
      label: "You",
      price: playerGuess,
      color: winner === "player" ? "#22c55e" : "#f59e0b",
      isWinner: winner === "player",
    },
    {
      key: "mkt",
      x: mX,
      label: "Market",
      price: marketPrice,
      color: "#e2e8f0",
      isWinner: false,
      dash: "4 2",
    },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Price gauge">
      {/* baseline */}
      <line
        x1={PAD}
        y1={H / 2}
        x2={W - PAD}
        y2={H / 2}
        stroke="currentColor"
        strokeOpacity={0.1}
        strokeWidth={1}
      />

      {/* shaded region between BS and RL */}
      <rect
        x={Math.min(bsX, rlX)}
        y={H / 2 - 3}
        width={Math.abs(rlX - bsX)}
        height={6}
        fill="#2d9cdb"
        fillOpacity={0.15}
        rx={2}
      />

      {markers.map((m) => (
        <g key={m.key}>
          <line
            x1={m.x}
            y1={12}
            x2={m.x}
            y2={H - 14}
            stroke={m.color}
            strokeWidth={m.isWinner ? 2.5 : 1.5}
            strokeDasharray={m.dash}
            strokeOpacity={m.key === "mkt" ? 0.6 : 1}
          />
          {m.isWinner && (
            <circle cx={m.x} cy={H / 2} r={5} fill={m.color} fillOpacity={0.25} />
          )}
          <text
            x={m.x}
            y={9}
            textAnchor="middle"
            fontSize={9}
            fill={m.color}
            fontWeight={m.isWinner ? "bold" : "normal"}
          >
            {m.label}
          </text>
          <text
            x={m.x}
            y={H - 3}
            textAnchor="middle"
            fontSize={8}
            fill={m.color}
            opacity={0.85}
          >
            ${m.price.toFixed(2)}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Mini score badge with color coding */
function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-green-500 text-white"
      : score >= 60
      ? "bg-blue-500 text-white"
      : score >= 40
      ? "bg-amber-500 text-white"
      : "bg-red-500 text-white";
  return (
    <div className={cn("inline-flex items-baseline gap-0.5 rounded-md px-2 py-0.5", color)}>
      <span className="text-base font-bold tabular-nums">{score}</span>
      <span className="text-[10px] opacity-75">/100</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface BeatBSModeProps {
  spotPrice: number;
  iv: number;
  ticker: string;
}

export function BeatBSMode({ spotPrice, iv, ticker }: BeatBSModeProps) {
  // Use a stable seed based on ticker + today's date so rounds refresh daily
  const seed = useMemo(() => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}${today.getMonth()}${today.getDate()}`;
    let h = 0;
    const key = ticker + dateStr;
    for (let i = 0; i < key.length; i++) {
      h = (Math.imul(31, h) + key.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }, [ticker]);

  const rounds = useMemo(
    () => generateRounds(spotPrice, iv, seed),
    [spotPrice, iv, seed]
  );

  const [phase, setPhase] = useState<Phase>("intro");
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [bestScore, setBestScore] = useState<number | null>(null);

  // Load best score on mount
  useEffect(() => {
    setBestScore(loadBest());
  }, []);

  const currentRound = rounds[currentRoundIdx];

  // Slider range: 0 to 2× ATM call price (so slider covers a meaningful range)
  const sliderMax = useMemo(() => {
    if (!currentRound) return 10;
    const atm = approxBSCall(
      currentRound.spotPrice,
      currentRound.spotPrice, // ATM
      currentRound.daysToExp / 365,
      currentRound.iv
    );
    return Math.max(atm * 2, 0.5);
  }, [currentRound]);

  // When round changes, reset slider to midpoint
  const prevRoundRef = useRef(-1);
  useEffect(() => {
    if (prevRoundRef.current !== currentRoundIdx) {
      prevRoundRef.current = currentRoundIdx;
      setSliderValue(sliderMax * 0.5);
    }
  }, [currentRoundIdx, sliderMax]);

  const handleStart = useCallback(() => {
    setCurrentRoundIdx(0);
    setResults([]);
    setPhase("guessing");
  }, []);

  const handleSubmitGuess = useCallback(() => {
    const round = rounds[currentRoundIdx];
    const playerGuess = sliderValue;
    const roundScore = computeRoundScore(playerGuess, round.bsPrice);
    const winner = closestToMarket(
      playerGuess,
      round.bsPrice,
      round.rlPrice,
      round.marketPrice
    );
    const result: RoundResult = { round, playerGuess, roundScore, winner };
    setResults((prev) => [...prev, result]);
    setPhase("reveal");
  }, [rounds, currentRoundIdx, sliderValue]);

  const handleNextRound = useCallback(() => {
    if (currentRoundIdx + 1 >= TOTAL_ROUNDS) {
      // Compute total score out of 1000 and save
      setPhase("summary");
    } else {
      setCurrentRoundIdx((i) => i + 1);
      setPhase("guessing");
    }
  }, [currentRoundIdx]);

  const handleRestart = useCallback(() => {
    setCurrentRoundIdx(0);
    setResults([]);
    setPhase("intro");
  }, []);

  // Total score on summary
  const totalScore = useMemo(
    () => results.reduce((sum, r) => sum + r.roundScore, 0),
    [results]
  );

  // Save best score when we enter summary
  useEffect(() => {
    if (phase === "summary") {
      const prev = loadBest();
      if (prev === null || totalScore > prev) {
        saveBest(totalScore);
        setBestScore(totalScore);
      }
    }
  }, [phase, totalScore]);

  const regimeLabel: Record<Regime, string> = {
    trending: "Trending",
    "mean-reverting": "Mean-Reverting",
    volatile: "Volatile",
    quiet: "Quiet",
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Beat the Model</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Price 10 options before Black-Scholes does. Outsmart the formula.
          </p>
        </div>
        {bestScore !== null && (
          <div className="rounded-md border border-border bg-card px-2.5 py-1.5 text-right">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Your best</p>
            <p className="text-sm font-bold tabular-nums text-primary">
              {bestScore}
              <span className="text-[10px] font-normal text-muted-foreground">/1000</span>
            </p>
          </div>
        )}
      </div>

      {/* ── Intro ── */}
      {phase === "intro" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <SectionLabel>How it works</SectionLabel>
            <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-primary/20 text-center text-[9px] font-bold leading-4 text-primary">1</span>
                <span>You see a live option contract: spot, strike, expiry, and IV.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-primary/20 text-center text-[9px] font-bold leading-4 text-primary">2</span>
                <span>Drag the slider to guess the fair call price.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-primary/20 text-center text-[9px] font-bold leading-4 text-primary">3</span>
                <span>We reveal BS price, RL-adjusted price, and simulated market price. Closest to market wins the round.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-primary/20 text-center text-[9px] font-bold leading-4 text-primary">4</span>
                <span>Score per round: 100 − |your guess − BS price| × 100, capped at 0. Max total: 1000.</span>
              </li>
            </ul>
          </div>

          {/* Ticker context */}
          <div className="rounded-lg border border-border bg-card p-3 flex items-center gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground">Ticker</p>
              <p className="text-sm font-bold">{ticker}</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-[10px] text-muted-foreground">Live Spot</p>
              <p className="text-sm font-bold tabular-nums">${spotPrice.toFixed(2)}</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-[10px] text-muted-foreground">Live IV</p>
              <p className="text-sm font-bold tabular-nums">{(iv * 100).toFixed(0)}%</p>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Start Challenge (10 rounds)
          </button>
        </div>
      )}

      {/* ── Guessing ── */}
      {phase === "guessing" && currentRound && (
        <div className="space-y-4">
          {/* Progress */}
          <div className="rounded-lg border border-border bg-card p-3">
            <ProgressBar current={currentRoundIdx + 1} total={TOTAL_ROUNDS} />
          </div>

          {/* Running score */}
          {results.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
              <SectionLabel>Score so far</SectionLabel>
              <span className="text-sm font-bold tabular-nums text-foreground">
                {results.reduce((s, r) => s + r.roundScore, 0)}
                <span className="text-xs font-normal text-muted-foreground">
                  /{results.length * 100}
                </span>
              </span>
            </div>
          )}

          {/* Contract details */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <SectionLabel>Contract Details</SectionLabel>
            <div className="mt-2 grid grid-cols-3 gap-x-4 gap-y-2 text-xs">
              {[
                { label: "Ticker", value: ticker },
                { label: "Spot (S)", value: `$${currentRound.spotPrice.toFixed(2)}` },
                { label: "Strike (K)", value: `$${currentRound.strike.toFixed(2)}` },
                { label: "Days (T)", value: `${currentRound.daysToExp}d` },
                { label: "IV", value: `${(currentRound.iv * 100).toFixed(0)}%` },
                {
                  label: "Moneyness",
                  value:
                    currentRound.moneyness < 0.98
                      ? "OTM"
                      : currentRound.moneyness > 1.02
                      ? "ITM"
                      : "ATM",
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-muted-foreground">{label}</p>
                  <p className="font-semibold tabular-nums">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Regime badge */}
          <div className="rounded-lg border border-border bg-card p-3 flex items-center gap-2">
            <SectionLabel>Regime</SectionLabel>
            <span className="ml-auto rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              {regimeLabel[currentRound.regime]}
            </span>
          </div>

          {/* Slider */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <SectionLabel>Your price estimate</SectionLabel>
              <span className="text-base font-bold tabular-nums text-foreground">
                ${sliderValue.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={sliderMax}
              step={sliderMax / 200}
              value={sliderValue}
              onChange={(e) => setSliderValue(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>$0.00</span>
              <span>${(sliderMax / 2).toFixed(2)}</span>
              <span>${sliderMax.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleSubmitGuess}
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Submit Estimate
          </button>
        </div>
      )}

      {/* ── Reveal ── */}
      {phase === "reveal" && currentRound && results.length > 0 && (() => {
        const latest = results[results.length - 1];
        const winnerLabel =
          latest.winner === "player"
            ? "You won this round!"
            : latest.winner === "rl"
            ? "RL model was closest"
            : "Black-Scholes was closest";
        const winnerColor =
          latest.winner === "player"
            ? "text-green-500"
            : latest.winner === "rl"
            ? "text-blue-400"
            : "text-muted-foreground";

        return (
          <div className="space-y-4">
            {/* Progress */}
            <div className="rounded-lg border border-border bg-card p-3">
              <ProgressBar current={currentRoundIdx + 1} total={TOTAL_ROUNDS} />
            </div>

            {/* Round score */}
            <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-4">
              <ScoreBadge score={latest.roundScore} />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold", winnerColor)}>{winnerLabel}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your guess: ${latest.playerGuess.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Price gauge */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <SectionLabel>Price Comparison</SectionLabel>
              <PriceGaugeSVG
                bsPrice={latest.round.bsPrice}
                rlPrice={latest.round.rlPrice}
                playerGuess={latest.playerGuess}
                marketPrice={latest.round.marketPrice}
                winner={latest.winner}
              />
              {/* Legend */}
              <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                {[
                  { label: "Market (actual)", color: "#e2e8f0", dash: true },
                  { label: "Black-Scholes", color: "#94a3b8", dash: false },
                  { label: "RL model", color: "#2d9cdb", dash: false },
                  { label: "Your guess", color: "#f59e0b", dash: false },
                ].map(({ label, color, dash }) => (
                  <span key={label} className="flex items-center gap-1">
                    <svg width={16} height={8}>
                      <line
                        x1={0}
                        y1={4}
                        x2={16}
                        y2={4}
                        stroke={color}
                        strokeWidth={2}
                        strokeDasharray={dash ? "4 2" : undefined}
                      />
                    </svg>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                {
                  label: "BS Price",
                  value: `$${latest.round.bsPrice.toFixed(2)}`,
                  win: latest.winner === "bs",
                },
                {
                  label: "RL Price",
                  value: `$${latest.round.rlPrice.toFixed(2)}`,
                  win: latest.winner === "rl",
                },
                {
                  label: "Market",
                  value: `$${latest.round.marketPrice.toFixed(2)}`,
                  win: false,
                },
                {
                  label: "RL Edge",
                  value: `${latest.round.rlEdge > 0 ? "+" : ""}${latest.round.rlEdge} bps`,
                  win: false,
                },
                {
                  label: "Confidence",
                  value: `${latest.round.rlConfidence}%`,
                  win: false,
                },
                {
                  label: "Regime",
                  value: regimeLabel[latest.round.regime],
                  win: false,
                },
              ].map(({ label, value, win }) => (
                <div
                  key={label}
                  className={cn(
                    "rounded-lg border p-2.5 text-center",
                    win
                      ? "border-green-500/40 bg-green-500/5"
                      : "border-border bg-card"
                  )}
                >
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                  <p
                    className={cn(
                      "mt-0.5 font-semibold tabular-nums",
                      win ? "text-green-500" : "text-foreground"
                    )}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Educational tooltip */}
            <div className="rounded-lg border border-border bg-primary/5 p-3 flex gap-2">
              <span className="mt-0.5 shrink-0 text-primary text-xs font-bold">i</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {REGIME_TOOLTIPS[latest.round.regime]}
              </p>
            </div>

            <button
              onClick={handleNextRound}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              {currentRoundIdx + 1 >= TOTAL_ROUNDS ? "See Final Score" : "Next Round"}
            </button>
          </div>
        );
      })()}

      {/* ── Summary ── */}
      {phase === "summary" && (
        <div className="space-y-4">
          {/* Final score */}
          <div className="rounded-lg border border-border bg-card p-6 text-center space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Final Score
            </p>
            <p className="text-5xl font-bold tabular-nums text-foreground">
              {totalScore}
            </p>
            <p className="text-sm text-muted-foreground">out of 1000</p>
            {bestScore !== null && totalScore >= bestScore && (
              <div className="inline-flex rounded-md bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-500">
                New personal best!
              </div>
            )}
          </div>

          {/* Best score */}
          {bestScore !== null && (
            <div className="rounded-lg border border-border bg-card px-4 py-3 flex items-center justify-between">
              <SectionLabel>Your best score</SectionLabel>
              <span className="text-sm font-bold tabular-nums text-primary">
                {bestScore}
                <span className="text-xs font-normal text-muted-foreground">/1000</span>
              </span>
            </div>
          )}

          {/* Round-by-round breakdown */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <SectionLabel>Round breakdown</SectionLabel>
            <div className="mt-2 space-y-2">
              {results.map((r, i) => {
                const winBg =
                  r.winner === "player"
                    ? "text-green-500"
                    : r.winner === "rl"
                    ? "text-blue-400"
                    : "text-muted-foreground";
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
                  >
                    <span className="w-5 shrink-0 text-center text-[10px] font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-[10px] text-muted-foreground capitalize">
                      {r.round.regime} · {r.round.daysToExp}d ·{" "}
                      {r.round.moneyness < 0.98
                        ? "OTM"
                        : r.round.moneyness > 1.02
                        ? "ITM"
                        : "ATM"}
                    </span>
                    <span className={cn("text-[10px] font-semibold", winBg)}>
                      {r.winner === "player"
                        ? "You"
                        : r.winner === "rl"
                        ? "RL"
                        : "BS"}{" "}
                      won
                    </span>
                    <span className="w-8 text-right text-xs font-bold tabular-nums text-foreground">
                      {r.roundScore}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Who won how many rounds */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {(["player", "rl", "bs"] as const).map((w) => {
              const count = results.filter((r) => r.winner === w).length;
              const label =
                w === "player" ? "You" : w === "rl" ? "RL Model" : "Black-Scholes";
              const color =
                w === "player"
                  ? "text-green-500"
                  : w === "rl"
                  ? "text-blue-400"
                  : "text-muted-foreground";
              return (
                <div
                  key={w}
                  className="rounded-lg border border-border bg-card p-3 text-center"
                >
                  <p className={cn("text-2xl font-bold tabular-nums", color)}>
                    {count}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
                  <p className="text-[9px] text-muted-foreground">rounds won</p>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRestart}
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
