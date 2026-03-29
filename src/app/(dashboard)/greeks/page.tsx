"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useGameStore } from "@/stores/game-store";
import {
  BookOpen,
  Calculator,
  BarChart2,
  Brain,
  Zap,
  Check,
  X,
  ChevronRight,
  TrendingUp,
  Info,
  FlaskConical,
} from "lucide-react";
import GreeksSimulator from "@/components/options/GreeksSimulator";

// ─── Black-Scholes Math ──────────────────────────────────────────────────────

/** Abramowitz & Stegun polynomial approximation of the standard normal CDF */
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const poly =
    t *
    (0.319381530 +
      t *
        (-0.356563782 +
          t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const pdf = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  const cdf = 1 - pdf * poly;
  return x >= 0 ? cdf : 1 - cdf;
}

function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

interface BSMResult {
  price: number;
  delta: number;
  gamma: number;
  theta: number; // per day
  vega: number;  // per 1% move in vol
  rho: number;   // per 1% move in rate
  d1: number;
  d2: number;
}

function bsm(
  S: number,
  K: number,
  T: number, // in days
  sigma: number, // fraction (0.30 = 30%)
  r: number,     // fraction (0.05 = 5%)
  isCall: boolean
): BSMResult {
  const Ty = T / 365; // convert days to years

  if (Ty <= 0 || sigma <= 0) {
    const intrinsic = isCall ? Math.max(0, S - K) : Math.max(0, K - S);
    return { price: intrinsic, delta: isCall ? (S > K ? 1 : 0) : (S < K ? -1 : 0), gamma: 0, theta: 0, vega: 0, rho: 0, d1: 0, d2: 0 };
  }

  const sqrtT = Math.sqrt(Ty);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * Ty) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  const Nd1 = normalCDF(d1);
  const Nd2 = normalCDF(d2);
  const Nnd1 = normalCDF(-d1);
  const Nnd2 = normalCDF(-d2);
  const discountK = K * Math.exp(-r * Ty);

  const price = isCall ? S * Nd1 - discountK * Nd2 : discountK * Nnd2 - S * Nnd1;

  const delta = isCall ? Nd1 : Nd1 - 1;
  const gamma = normalPDF(d1) / (S * sigma * sqrtT);

  // Theta: per year, converted to per day by dividing by 365
  const thetaCall = -(S * normalPDF(d1) * sigma) / (2 * sqrtT) - r * discountK * Nd2;
  const thetaPut = -(S * normalPDF(d1) * sigma) / (2 * sqrtT) + r * discountK * Nnd2;
  const theta = (isCall ? thetaCall : thetaPut) / 365;

  // Vega: per 1 (100%) move in vol, then divide by 100 to get per 1%
  const vegaRaw = S * sqrtT * normalPDF(d1);
  const vega = vegaRaw / 100;

  // Rho: per 1 (100%) move in rate, divide by 100 for per 1%
  const rhoCall = discountK * Ty * Nd2;
  const rhoPut = -discountK * Ty * Nnd2;
  const rho = (isCall ? rhoCall : rhoPut) / 100;

  return { price, delta, gamma, theta, vega, rho, d1, d2 };
}

// Second-order Greeks via finite differences
interface SecondOrderGreeks {
  vanna: number;  // dDelta/dSigma — per 1% sigma
  volga: number;  // dVega/dSigma — per 1% sigma
  charm: number;  // dDelta/dT per day
  color: number;  // dGamma/dT per day
}

function computeSecondOrder(
  S: number,
  K: number,
  T: number,
  sigma: number,
  r: number,
  isCall: boolean
): SecondOrderGreeks {
  const bump = 0.001; // 0.1% for numerical derivatives
  const dayBump = 1;

  const base = bsm(S, K, T, sigma, r, isCall);
  const sigUp = bsm(S, K, T, sigma + bump, r, isCall);
  const tDown = T > dayBump ? bsm(S, K, T - dayBump, sigma, r, isCall) : base;

  const vanna = (sigUp.delta - base.delta) / (bump * 100);
  const volga = (sigUp.vega - base.vega) / (bump * 100);
  const charm = T > dayBump ? (tDown.delta - base.delta) / dayBump : 0;
  const color = T > dayBump ? (tDown.gamma - base.gamma) / dayBump : 0;

  return { vanna, volga, charm, color };
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface SliderParams {
  S: number;
  K: number;
  T: number;
  sigma: number;
  r: number;
  isCall: boolean;
}

interface GreekDelta {
  name: string;
  prev: number;
  curr: number;
  diff: number;
}

// ─── Chart helpers ───────────────────────────────────────────────────────────

const W = 380;
const H = 220;
const PAD = { top: 16, right: 16, bottom: 32, left: 48 };
const CW = W - PAD.left - PAD.right;
const CH = H - PAD.top - PAD.bottom;

function xScale(val: number, min: number, max: number) {
  return PAD.left + ((val - min) / (max - min)) * CW;
}
function yScale(val: number, min: number, max: number) {
  return PAD.top + CH - ((val - min) / (max - min)) * CH;
}

function polyline(points: [number, number][]): string {
  return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

// ─── Quiz Data ───────────────────────────────────────────────────────────────

interface QuizQuestion {
  id: number;
  scenario: string;
  question: string;
  choices: string[];
  correct: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    scenario: "You own a call option with delta 0.50. The stock rallies $5.",
    question: "What happens to delta as the stock rises?",
    choices: [
      "Delta decreases toward 0",
      "Delta stays at 0.50",
      "Delta increases toward 1",
      "Delta becomes negative",
    ],
    correct: 2,
    explanation:
      "As a call moves deeper in-the-money, delta approaches 1. Gamma is what drives this change — it tells you how quickly delta moves.",
  },
  {
    id: 2,
    scenario: "You hold a long straddle (long call + long put) at-the-money with 5 DTE.",
    question: "Which Greek is hurting your position the most each day?",
    choices: ["Delta", "Gamma", "Theta", "Vega"],
    correct: 2,
    explanation:
      "Theta (time decay) accelerates near expiry, particularly for ATM options. Your straddle loses value each day even if the stock doesn't move.",
  },
  {
    id: 3,
    scenario: "You want to know your position's sensitivity to an implied volatility spike.",
    question: "Which Greek measures exposure to volatility changes?",
    choices: ["Delta", "Gamma", "Theta", "Vega"],
    correct: 3,
    explanation:
      "Vega measures how much the option price changes per 1% change in implied volatility. Long options have positive vega (benefit from vol increases).",
  },
  {
    id: 4,
    scenario: "You sold an iron condor. Your short strikes are delta 0.16.",
    question: "What does negative gamma mean for your short option position?",
    choices: [
      "Your position profits when the stock moves big",
      "Your delta improves automatically",
      "Risk increases as price moves in either direction",
      "Time decay accelerates your gains",
    ],
    correct: 2,
    explanation:
      "Negative gamma means your delta moves against you as price moves. Short gamma positions hurt when the underlying makes large moves.",
  },
  {
    id: 5,
    scenario: "A call has delta 0.30. Gamma is 0.05. The stock moves up $1.",
    question: "What is the new approximate delta?",
    choices: ["0.25", "0.30", "0.35", "0.50"],
    correct: 2,
    explanation:
      "New delta ≈ old delta + gamma × price move = 0.30 + 0.05 × 1 = 0.35. Gamma tells you how much delta changes per $1 move.",
  },
  {
    id: 6,
    scenario: "You are delta-hedging a long call position daily.",
    question: "Which second-order Greek tells you how your delta changes with time?",
    choices: ["Vanna", "Volga", "Charm", "Color"],
    correct: 2,
    explanation:
      "Charm (dDelta/dTime) tells delta hedgers how much their hedge ratio drifts overnight. Missing charm can cause hedging slippage.",
  },
  {
    id: 7,
    scenario: "Implied volatility spikes from 25% to 35%. You are long a call.",
    question: "What happens to your option's delta via Vanna?",
    choices: [
      "Delta is unaffected by IV changes",
      "Delta shifts because vanna describes dDelta/dIV",
      "Delta always increases with IV",
      "Delta goes to zero",
    ],
    correct: 1,
    explanation:
      "Vanna (dDelta/dIV) captures how delta changes with implied volatility. ATM options have near-zero vanna; OTM/ITM options are more affected.",
  },
  {
    id: 8,
    scenario: "You own a put with delta -0.40. The stock drops $2.",
    question: "Approximately how much does your put gain in value?",
    choices: ["$0.40", "$0.80", "$0.40 gain per share", "$0.80 gain per share"],
    correct: 3,
    explanation:
      "Put P&L ≈ delta × price move = (-0.40) × (-2) = +$0.80 per share. The put gains because delta is negative and the stock fell.",
  },
  {
    id: 9,
    scenario: "Two options, same expiry: an ATM call and a deep ITM call.",
    question: "Which has higher gamma?",
    choices: [
      "Deep ITM call — it has more intrinsic value",
      "ATM call — gamma peaks at-the-money",
      "They have equal gamma",
      "Deep OTM call always has highest gamma",
    ],
    correct: 1,
    explanation:
      "Gamma is highest for at-the-money options and falls off for ITM/OTM strikes. This is why ATM options are most sensitive to spot moves.",
  },
  {
    id: 10,
    scenario: "You own long-dated calls (180 DTE) vs short-dated calls (7 DTE).",
    question: "Which position has higher vega (more sensitivity to IV changes)?",
    choices: [
      "7 DTE — more urgent options",
      "180 DTE — vega scales with √T",
      "They have equal vega",
      "Vega does not depend on time",
    ],
    correct: 1,
    explanation:
      "Vega increases with time to expiry (∝ √T). Long-dated options are much more sensitive to IV changes than short-dated ones.",
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function GreekCard({
  label,
  value,
  color,
  description,
  delta,
}: {
  label: string;
  value: number;
  color: string;
  description: string;
  delta?: GreekDelta | null;
}) {
  const fmt = (v: number) => {
    if (Math.abs(v) < 0.0001) return "0.0000";
    if (Math.abs(v) >= 100) return v.toFixed(2);
    return v.toFixed(4);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        {delta && (
          <motion.span
            key={delta.curr.toFixed(6)}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xs font-mono px-1.5 py-0.5 rounded ${
              delta.diff > 0
                ? "bg-green-500/10 text-green-400"
                : delta.diff < 0
                ? "bg-red-500/10 text-red-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {delta.diff > 0 ? "+" : ""}
            {delta.diff.toFixed(4)}
          </motion.span>
        )}
      </div>
      <motion.div
        key={value.toFixed(6)}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={`text-2xl font-mono font-bold ${color}`}
      >
        {fmt(value)}
      </motion.div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

// ─── SVG Charts ──────────────────────────────────────────────────────────────

function DeltaChart({ params }: { params: SliderParams }) {
  const { S, K, T, sigma, r, isCall } = params;
  const prices = Array.from({ length: 61 }, (_, i) => 60 + i * 1); // 60–120

  const callDeltas = prices.map((p) => bsm(p, K, T, sigma, r, true).delta);
  const putDeltas = prices.map((p) => bsm(p, K, T, sigma, r, false).delta);

  const minY = -1.05;
  const maxY = 1.05;

  const callPts = prices.map(
    (p, i): [number, number] => [xScale(p, 60, 120), yScale(callDeltas[i], minY, maxY)]
  );
  const putPts = prices.map(
    (p, i): [number, number] => [xScale(p, 60, 120), yScale(putDeltas[i], minY, maxY)]
  );

  const currentCallDelta = bsm(S, K, T, sigma, r, true).delta;
  const currentPutDelta = bsm(S, K, T, sigma, r, false).delta;
  const curX = xScale(S, 60, 120);
  const curCallY = yScale(currentCallDelta, minY, maxY);
  const curPutY = yScale(currentPutDelta, minY, maxY);
  const zeroY = yScale(0, minY, maxY);

  // Y-axis ticks
  const yTicks = [-1, -0.5, 0, 0.5, 1];

  return (
    <svg width={W} height={H} className="overflow-visible">
      {/* Zero line */}
      <line
        x1={PAD.left}
        y1={zeroY}
        x2={W - PAD.right}
        y2={zeroY}
        stroke="currentColor"
        strokeOpacity={0.15}
        strokeDasharray="4,3"
        className="text-foreground"
      />
      {/* Call delta */}
      <polyline
        points={polyline(callPts)}
        fill="none"
        stroke="#22c55e"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* Put delta */}
      <polyline
        points={polyline(putPts)}
        fill="none"
        stroke="#ef4444"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* Current S vertical */}
      <line
        x1={curX}
        y1={PAD.top}
        x2={curX}
        y2={H - PAD.bottom}
        stroke="#a78bfa"
        strokeWidth={1.5}
        strokeDasharray="4,3"
      />
      {/* Dots at current S */}
      <circle cx={curX} cy={curCallY} r={4} fill="#22c55e" />
      <circle cx={curX} cy={curPutY} r={4} fill="#ef4444" />
      {/* Y axis labels */}
      {yTicks.map((v) => (
        <text
          key={v}
          x={PAD.left - 6}
          y={yScale(v, minY, maxY) + 4}
          fontSize={9}
          fill="currentColor"
          fillOpacity={0.5}
          textAnchor="end"
          className="text-foreground"
        >
          {v.toFixed(1)}
        </text>
      ))}
      {/* X axis labels */}
      {[70, 80, 90, 100, 110, 120].map((v) => (
        <text
          key={v}
          x={xScale(v, 60, 120)}
          y={H - PAD.bottom + 14}
          fontSize={9}
          fill="currentColor"
          fillOpacity={0.5}
          textAnchor="middle"
          className="text-foreground"
        >
          {v}
        </text>
      ))}
      {/* Legend */}
      <circle cx={PAD.left + 8} cy={PAD.top + 8} r={4} fill="#22c55e" />
      <text x={PAD.left + 16} y={PAD.top + 12} fontSize={9} fill="#22c55e">Call</text>
      <circle cx={PAD.left + 44} cy={PAD.top + 8} r={4} fill="#ef4444" />
      <text x={PAD.left + 52} y={PAD.top + 12} fontSize={9} fill="#ef4444">Put</text>
    </svg>
  );
}

function GammaChart({ params }: { params: SliderParams }) {
  const { K, T, sigma, r } = params;
  const prices = Array.from({ length: 61 }, (_, i) => 60 + i * 1);

  const gammas = prices.map((p) => bsm(p, K, T, sigma, r, true).gamma);
  const maxGamma = Math.max(...gammas, 0.001);

  const pts = prices.map(
    (p, i): [number, number] => [xScale(p, 60, 120), yScale(gammas[i], 0, maxGamma * 1.1)]
  );

  const atmX = xScale(K, 60, 120);
  const atmY = yScale(bsm(K, K, T, sigma, r, true).gamma, 0, maxGamma * 1.1);

  // Gamma risk zone shading (±10 around ATM)
  const zoneX1 = xScale(K - 8, 60, 120);
  const zoneX2 = xScale(K + 8, 60, 120);
  const zoneH = yScale(0, 0, maxGamma * 1.1);

  return (
    <svg width={W} height={H} className="overflow-visible">
      {/* Risk zone */}
      <rect
        x={Math.max(PAD.left, zoneX1)}
        y={PAD.top}
        width={Math.min(W - PAD.right, zoneX2) - Math.max(PAD.left, zoneX1)}
        height={zoneH - PAD.top}
        fill="#f59e0b"
        fillOpacity={0.07}
      />
      {/* Gamma curve */}
      <polyline
        points={polyline(pts)}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* Fill under curve */}
      <polyline
        points={[
          [PAD.left, zoneH] as [number, number],
          ...pts,
          [W - PAD.right, zoneH] as [number, number],
        ]
          .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
          .join(" ")}
        fill="#f59e0b"
        fillOpacity={0.12}
        stroke="none"
      />
      {/* ATM marker */}
      <line x1={atmX} y1={PAD.top} x2={atmX} y2={zoneH} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4,3" />
      <circle cx={atmX} cy={atmY} r={4} fill="#f59e0b" />
      {/* Labels */}
      <text x={atmX} y={PAD.top + 10} fontSize={9} fill="#f59e0b" textAnchor="middle">ATM</text>
      <text x={PAD.left + 8} y={PAD.top + 22} fontSize={8} fill="#f59e0b" fillOpacity={0.7}>Gamma risk zone</text>
      {/* Y axis */}
      {[0, maxGamma * 0.5, maxGamma].map((v) => (
        <text
          key={v.toFixed(4)}
          x={PAD.left - 4}
          y={yScale(v, 0, maxGamma * 1.1) + 4}
          fontSize={8}
          fill="currentColor"
          fillOpacity={0.5}
          textAnchor="end"
          className="text-foreground"
        >
          {v.toFixed(3)}
        </text>
      ))}
      {/* X axis */}
      {[70, 80, 90, 100, 110, 120].map((v) => (
        <text
          key={v}
          x={xScale(v, 60, 120)}
          y={H - PAD.bottom + 14}
          fontSize={9}
          fill="currentColor"
          fillOpacity={0.5}
          textAnchor="middle"
          className="text-foreground"
        >
          {v}
        </text>
      ))}
    </svg>
  );
}

function ThetaChart({ params }: { params: SliderParams }) {
  const { S, K, sigma, r, isCall } = params;
  // X axis: days to expiry 1–90
  const days = Array.from({ length: 90 }, (_, i) => i + 1);
  const thetas = days.map((d) => bsm(S, K, d, sigma, r, isCall).theta);

  const minTheta = Math.min(...thetas, -0.001);
  const maxTheta = 0.01;

  const pts = days.map(
    (d, i): [number, number] => [xScale(d, 0, 90), yScale(thetas[i], minTheta, maxTheta)]
  );

  const curX = xScale(params.T, 0, 90);
  const curTheta = bsm(S, K, params.T, sigma, r, isCall).theta;
  const curY = yScale(curTheta, minTheta, maxTheta);
  const zeroY = yScale(0, minTheta, maxTheta);

  return (
    <svg width={W} height={H} className="overflow-visible">
      {/* Zero line */}
      <line
        x1={PAD.left}
        y1={zeroY}
        x2={W - PAD.right}
        y2={zeroY}
        stroke="currentColor"
        strokeOpacity={0.15}
        strokeDasharray="4,3"
        className="text-foreground"
      />
      {/* Theta curve */}
      <polyline
        points={polyline(pts)}
        fill="none"
        stroke="#818cf8"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* Fill */}
      <polyline
        points={[
          [PAD.left, zeroY] as [number, number],
          ...pts,
          [W - PAD.right, zeroY] as [number, number],
        ]
          .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
          .join(" ")}
        fill="#818cf8"
        fillOpacity={0.1}
        stroke="none"
      />
      {/* Current DTE */}
      <line x1={curX} y1={PAD.top} x2={curX} y2={H - PAD.bottom} stroke="#818cf8" strokeWidth={1.5} strokeDasharray="4,3" />
      <circle cx={curX} cy={curY} r={4} fill="#818cf8" />
      {/* Weekend label near low DTE */}
      <text x={xScale(7, 0, 90)} y={PAD.top + 10} fontSize={8} fill="#818cf8" fillOpacity={0.7} textAnchor="middle">
        Weekend accel.
      </text>
      {/* Y axis */}
      {[minTheta, minTheta * 0.5, 0].map((v) => (
        <text
          key={v.toFixed(5)}
          x={PAD.left - 4}
          y={yScale(v, minTheta, maxTheta) + 4}
          fontSize={8}
          fill="currentColor"
          fillOpacity={0.5}
          textAnchor="end"
          className="text-foreground"
        >
          {v.toFixed(3)}
        </text>
      ))}
      {/* X axis */}
      {[10, 30, 60, 90].map((v) => (
        <text
          key={v}
          x={xScale(v, 0, 90)}
          y={H - PAD.bottom + 14}
          fontSize={9}
          fill="currentColor"
          fillOpacity={0.5}
          textAnchor="middle"
          className="text-foreground"
        >
          {v}d
        </text>
      ))}
    </svg>
  );
}

function VegaChart({ params }: { params: SliderParams }) {
  const { S, K, T, r, isCall } = params;
  // X axis: IV from 5% to 100%
  const ivs = Array.from({ length: 96 }, (_, i) => (i + 5) / 100);
  const vegas = ivs.map((iv) => bsm(S, K, T, iv, r, isCall).vega);
  const maxVega = Math.max(...vegas, 0.001);

  const pts = ivs.map(
    (iv, i): [number, number] => [xScale(iv, 0.05, 1.0), yScale(vegas[i], 0, maxVega * 1.1)]
  );

  const curX = xScale(params.sigma, 0.05, 1.0);
  const curVega = bsm(S, K, T, params.sigma, r, isCall).vega;
  const curY = yScale(curVega, 0, maxVega * 1.1);
  const baseY = yScale(0, 0, maxVega * 1.1);

  return (
    <svg width={W} height={H} className="overflow-visible">
      {/* Vega curve */}
      <polyline
        points={polyline(pts)}
        fill="none"
        stroke="#06b6d4"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* Fill */}
      <polyline
        points={[
          [xScale(0.05, 0.05, 1.0), baseY] as [number, number],
          ...pts,
          [xScale(1.0, 0.05, 1.0), baseY] as [number, number],
        ]
          .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
          .join(" ")}
        fill="#06b6d4"
        fillOpacity={0.1}
        stroke="none"
      />
      {/* Current IV */}
      <line x1={curX} y1={PAD.top} x2={curX} y2={H - PAD.bottom} stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="4,3" />
      <circle cx={curX} cy={curY} r={4} fill="#06b6d4" />
      {/* Y axis */}
      {[0, maxVega * 0.5, maxVega].map((v) => (
        <text
          key={v.toFixed(4)}
          x={PAD.left - 4}
          y={yScale(v, 0, maxVega * 1.1) + 4}
          fontSize={8}
          fill="currentColor"
          fillOpacity={0.5}
          textAnchor="end"
          className="text-foreground"
        >
          {v.toFixed(3)}
        </text>
      ))}
      {/* X axis */}
      {[10, 25, 50, 75, 100].map((v) => (
        <text
          key={v}
          x={xScale(v / 100, 0.05, 1.0)}
          y={H - PAD.bottom + 14}
          fontSize={9}
          fill="currentColor"
          fillOpacity={0.5}
          textAnchor="middle"
          className="text-foreground"
        >
          {v}%
        </text>
      ))}
    </svg>
  );
}

// Second-order Greek mini chart helper
function SecondOrderChart({
  label,
  color,
  xLabel,
  yLabel,
  xMin,
  xMax,
  getY,
  currentX,
}: {
  label: string;
  color: string;
  xLabel: string;
  yLabel: string;
  xMin: number;
  xMax: number;
  getY: (x: number) => number;
  currentX: number;
}) {
  const xs = Array.from({ length: 60 }, (_, i) => xMin + (i / 59) * (xMax - xMin));
  const ys = xs.map(getY);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeY = maxY - minY || 0.0001;

  const pts = xs.map(
    (x, i): [number, number] => [xScale(x, xMin, xMax), yScale(ys[i], minY - rangeY * 0.1, maxY + rangeY * 0.1)]
  );
  const curX = xScale(currentX, xMin, xMax);
  const curY = yScale(getY(currentX), minY - rangeY * 0.1, maxY + rangeY * 0.1);
  const zeroY = yScale(0, minY - rangeY * 0.1, maxY + rangeY * 0.1);

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-xs font-semibold text-foreground mb-2">{label}</p>
      <svg width={W - 32} height={160} className="overflow-visible">
        <line
          x1={PAD.left}
          y1={Math.max(PAD.top, Math.min(160 - PAD.bottom, zeroY))}
          x2={(W - 32) - PAD.right}
          y2={Math.max(PAD.top, Math.min(160 - PAD.bottom, zeroY))}
          stroke="currentColor"
          strokeOpacity={0.15}
          strokeDasharray="4,3"
          className="text-foreground"
        />
        <polyline
          points={polyline(pts)}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <line
          x1={curX}
          y1={PAD.top}
          x2={curX}
          y2={160 - PAD.bottom}
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray="4,3"
        />
        <circle cx={curX} cy={curY} r={4} fill={color} />
        <text
          x={PAD.left}
          y={160 - PAD.bottom + 14}
          fontSize={8}
          fill="currentColor"
          fillOpacity={0.5}
        >
          {xLabel}
        </text>
        <text
          x={PAD.left - 4}
          y={PAD.top + 4}
          fontSize={8}
          fill="currentColor"
          fillOpacity={0.5}
          textAnchor="end"
        >
          {yLabel}
        </text>
      </svg>
    </div>
  );
}

// ─── Tab 1: Greeks Explorer ───────────────────────────────────────────────────

function GreeksExplorer() {
  const [params, setParams] = useState<SliderParams>({
    S: 100,
    K: 100,
    T: 30,
    sigma: 0.30,
    r: 0.05,
    isCall: true,
  });
  const prevResult = useRef<BSMResult | null>(null);
  const [deltas, setDeltas] = useState<GreekDelta[]>([]);

  const result = useMemo(() => bsm(params.S, params.K, params.T, params.sigma, params.r, params.isCall), [params]);

  useEffect(() => {
    if (prevResult.current) {
      const prev = prevResult.current;
      const newDeltas: GreekDelta[] = [
        { name: "Delta", prev: prev.delta, curr: result.delta, diff: result.delta - prev.delta },
        { name: "Gamma", prev: prev.gamma, curr: result.gamma, diff: result.gamma - prev.gamma },
        { name: "Theta", prev: prev.theta, curr: result.theta, diff: result.theta - prev.theta },
        { name: "Vega", prev: prev.vega, curr: result.vega, diff: result.vega - prev.vega },
        { name: "Rho", prev: prev.rho, curr: result.rho, diff: result.rho - prev.rho },
      ];
      setDeltas(newDeltas.filter((d) => Math.abs(d.diff) > 0.000001));
    }
    prevResult.current = result;
  }, [result]);

  function setParam<K extends keyof SliderParams>(key: K, val: SliderParams[K]) {
    setParams((p) => ({ ...p, [key]: val }));
  }

  const sliders: {
    label: string;
    key: keyof SliderParams;
    min: number;
    max: number;
    step: number;
    fmt: (v: number) => string;
    value: number;
  }[] = [
    { label: "Stock Price (S)", key: "S", min: 80, max: 120, step: 0.5, fmt: (v) => `$${v.toFixed(1)}`, value: params.S },
    { label: "Strike (K)", key: "K", min: 80, max: 120, step: 0.5, fmt: (v) => `$${v.toFixed(1)}`, value: params.K },
    { label: "Days to Expiry (T)", key: "T", min: 1, max: 365, step: 1, fmt: (v) => `${v}d`, value: params.T },
    { label: "Volatility (σ)", key: "sigma", min: 0.10, max: 1.0, step: 0.01, fmt: (v) => `${(v * 100).toFixed(0)}%`, value: params.sigma },
    { label: "Risk-Free Rate (r)", key: "r", min: 0, max: 0.10, step: 0.001, fmt: (v) => `${(v * 100).toFixed(1)}%`, value: params.r },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Controls */}
      <div className="flex flex-col gap-4">
        {/* Option type toggle */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">Option Type</p>
          <div className="flex gap-2">
            <button
              onClick={() => setParam("isCall", true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                params.isCall
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-muted text-muted-foreground border border-transparent"
              }`}
            >
              Call
            </button>
            <button
              onClick={() => setParam("isCall", false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                !params.isCall
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-muted text-muted-foreground border border-transparent"
              }`}
            >
              Put
            </button>
          </div>
        </div>

        {/* Sliders */}
        {sliders.map((s) => (
          <div key={s.key} className="rounded-xl border border-border bg-card p-4">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              <span className="text-sm font-mono font-semibold text-foreground">{s.fmt(s.value)}</span>
            </div>
            <Slider
              min={s.min}
              max={s.max}
              step={s.step}
              value={[s.value]}
              onValueChange={([v]) => setParam(s.key as keyof SliderParams, v as SliderParams[typeof s.key])}
            />
          </div>
        ))}

        {/* BSM Formula display */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">Black-Scholes Formulas</p>
          <div className="font-mono text-xs space-y-1.5 text-foreground/80">
            <p className="text-[11px]">d₁ = [ln(S/K) + (r + σ²/2)T] / (σ√T)</p>
            <p className="text-[11px]">d₂ = d₁ - σ√T</p>
            <p className="text-[11px]">Call = S×N(d₁) - K×e<sup>-rT</sup>×N(d₂)</p>
            <p className="text-[11px]">Put = K×e<sup>-rT</sup>×N(-d₂) - S×N(-d₁)</p>
            <div className="mt-2 pt-2 border-t border-border/50 space-y-1 text-muted-foreground">
              <p>d₁ = {result.d1.toFixed(4)}</p>
              <p>d₂ = {result.d2.toFixed(4)}</p>
              <p>N(d₁) = {normalCDF(result.d1).toFixed(4)}</p>
              <p>N(d₂) = {normalCDF(result.d2).toFixed(4)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Greeks output */}
      <div className="flex flex-col gap-4">
        {/* Price */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {params.isCall ? "Call" : "Put"} Price
          </p>
          <motion.p
            key={result.price.toFixed(4)}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="text-2xl font-mono font-bold text-primary"
          >
            ${result.price.toFixed(4)}
          </motion.p>
        </div>

        {/* Greeks grid */}
        <div className="grid grid-cols-2 gap-3">
          <GreekCard
            label="Delta (Δ)"
            value={result.delta}
            color={result.delta >= 0 ? "text-green-400" : "text-red-400"}
            description="Price change per $1 stock move"
            delta={deltas.find((d) => d.name === "Delta") ?? null}
          />
          <GreekCard
            label="Gamma (Γ)"
            value={result.gamma}
            color="text-amber-400"
            description="Delta change per $1 stock move"
            delta={deltas.find((d) => d.name === "Gamma") ?? null}
          />
          <GreekCard
            label="Theta (Θ)"
            value={result.theta}
            color="text-primary"
            description="Price decay per calendar day"
            delta={deltas.find((d) => d.name === "Theta") ?? null}
          />
          <GreekCard
            label="Vega (ν)"
            value={result.vega}
            color="text-muted-foreground"
            description="Price change per 1% IV move"
            delta={deltas.find((d) => d.name === "Vega") ?? null}
          />
          <GreekCard
            label="Rho (ρ)"
            value={result.rho}
            color="text-sky-400"
            description="Price change per 1% rate move"
            delta={deltas.find((d) => d.name === "Rho") ?? null}
          />
        </div>

        {/* What changed */}
        <AnimatePresence mode="popLayout">
          {deltas.length > 0 && (
            <motion.div
              key={deltas.map((d) => d.name).join(",")}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-xl border border-border bg-card p-3"
            >
              <p className="text-xs font-medium text-muted-foreground mb-2">What Changed</p>
              <div className="flex flex-wrap gap-2">
                {deltas.map((d) => (
                  <span
                    key={d.name}
                    className={`text-xs px-2 py-1 rounded-full font-mono ${
                      d.diff > 0
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {d.name} {d.diff > 0 ? "+" : ""}{d.diff.toFixed(4)}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Tab 2: Greeks Visualized ─────────────────────────────────────────────────

function GreeksVisualized({ params }: { params: SliderParams }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const charts = [
    {
      id: "delta",
      title: "Delta vs Stock Price",
      subtitle: "S-curve: 0→1 (call), -1→0 (put)",
      component: <DeltaChart params={params} />,
      insight: `At current S=$${params.S}, call delta is ${bsm(params.S, params.K, params.T, params.sigma, params.r, true).delta.toFixed(3)} and put delta is ${bsm(params.S, params.K, params.T, params.sigma, params.r, false).delta.toFixed(3)}.`,
    },
    {
      id: "gamma",
      title: "Gamma vs Stock Price",
      subtitle: "Bell curve peaking ATM — gamma risk zone",
      component: <GammaChart params={params} />,
      insight: `Gamma peaks ATM at strike $${params.K}. Current gamma = ${bsm(params.S, params.K, params.T, params.sigma, params.r, true).gamma.toFixed(5)}.`,
    },
    {
      id: "theta",
      title: "Theta vs Days to Expiry",
      subtitle: "Accelerating decay — hurts longs near expiry",
      component: <ThetaChart params={params} />,
      insight: `At ${params.T} DTE, daily theta = ${bsm(params.S, params.K, params.T, params.sigma, params.r, params.isCall).theta.toFixed(4)} (negative = daily loss for option buyers).`,
    },
    {
      id: "vega",
      title: "Vega vs Implied Volatility",
      subtitle: "Linear: more time = more vega sensitivity",
      component: <VegaChart params={params} />,
      insight: `At ${(params.sigma * 100).toFixed(0)}% IV, vega = ${bsm(params.S, params.K, params.T, params.sigma, params.r, params.isCall).vega.toFixed(4)}. A 1% IV change shifts price by $${bsm(params.S, params.K, params.T, params.sigma, params.r, params.isCall).vega.toFixed(4)}.`,
    },
  ];

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-4">
        All charts update live from Tab 1 sliders. Click any chart to expand.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {charts.map((c) => (
          <motion.div
            key={c.id}
            layout
            onClick={() => setExpanded(expanded === c.id ? null : c.id)}
            className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/30 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.subtitle}</p>
              </div>
              <ChevronRight
                className={`size-4 text-muted-foreground transition-transform ${
                  expanded === c.id ? "rotate-90" : ""
                }`}
              />
            </div>
            <div className="overflow-hidden">
              {c.component}
            </div>
            <AnimatePresence>
              {expanded === c.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 pt-3 border-t border-border"
                >
                  <div className="flex gap-2 items-start">
                    <Info className="size-3.5 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-foreground/80">{c.insight}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab 3: Second-Order Greeks ───────────────────────────────────────────────

function SecondOrderGreeksTab({ params }: { params: SliderParams }) {
  const { S, K, T, sigma, r, isCall } = params;
  const second = computeSecondOrder(S, K, T, sigma, r, isCall);

  const explanations = [
    {
      name: "Vanna",
      symbol: "∂Δ/∂σ",
      value: second.vanna,
      color: "#a78bfa",
      description: "How delta changes with implied volatility. Critical for vol hedgers — when IV spikes, delta exposures shift even without spot moving.",
      whyMatters: "Traders managing large option books use vanna to stay delta-neutral after IV moves. ATM options have near-zero vanna; OTM/ITM options are more affected.",
      getY: (x: number) => computeSecondOrder(x, K, T, sigma, r, isCall).vanna,
      xMin: 70,
      xMax: 130,
      xLabel: "Stock Price",
      yLabel: "Vanna",
      currentX: S,
    },
    {
      name: "Volga / Vomma",
      symbol: "∂Vega/∂σ",
      value: second.volga,
      color: "#06b6d4",
      description: "How vega changes with implied volatility. Positive volga = you benefit from vol-of-vol. Central to vol surface trading and exotic options.",
      whyMatters: "Long OTM straddles have positive volga — they benefit when volatility itself becomes more volatile. Used for vol surface arbitrage.",
      getY: (x: number) => computeSecondOrder(S, K, T, x, r, isCall).volga,
      xMin: 0.10,
      xMax: 0.80,
      xLabel: "IV",
      yLabel: "Volga",
      currentX: sigma,
    },
    {
      name: "Charm",
      symbol: "∂Δ/∂t",
      value: second.charm,
      color: "#f59e0b",
      description: "How delta changes with the passage of time (delta decay). Delta hedgers must account for charm drift overnight — especially near expiry.",
      whyMatters: "A market maker delta-hedging a short-dated ATM option must re-hedge as delta drifts due to charm. Ignoring it causes tracking error.",
      getY: (x: number) => (x > 1 ? computeSecondOrder(S, K, x, sigma, r, isCall).charm : 0),
      xMin: 5,
      xMax: 90,
      xLabel: "Days to Expiry",
      yLabel: "Charm",
      currentX: Math.max(5, T),
    },
    {
      name: "Color",
      symbol: "∂Γ/∂t",
      value: second.color,
      color: "#22c55e",
      description: "Rate of change of gamma over time. Shows how the gamma profile shifts as expiry approaches — important for gamma scalpers.",
      whyMatters: "Color tells you how aggressively your gamma position grows as expiry nears. High color = your gamma position will change substantially over the next week.",
      getY: (x: number) => (x > 1 ? computeSecondOrder(S, K, x, sigma, r, isCall).color : 0),
      xMin: 5,
      xMax: 90,
      xLabel: "Days to Expiry",
      yLabel: "Color",
      currentX: Math.max(5, T),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="size-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Second-Order Greeks</p>
        </div>
        <p className="text-xs text-muted-foreground">
          First-order Greeks (delta, gamma, theta, vega, rho) measure direct sensitivity. Second-order Greeks measure
          how the first-order Greeks themselves change — essential for sophisticated risk management, vol surface
          trading, and professional delta hedging.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {explanations.map((g) => (
          <div key={g.name} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{g.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{g.symbol}</p>
              </div>
              <div
                className="px-2 py-1 rounded-lg text-sm font-mono font-bold"
                style={{ color: g.color, backgroundColor: g.color + "20" }}
              >
                {g.value.toFixed(5)}
              </div>
            </div>
            <p className="text-xs text-foreground/80">{g.description}</p>
            <SecondOrderChart
              label={`${g.name} curve`}
              color={g.color}
              xLabel={g.xLabel}
              yLabel={g.yLabel}
              xMin={g.xMin}
              xMax={g.xMax}
              getY={g.getY}
              currentX={g.currentX}
            />
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-foreground/70 mb-1">Why this matters</p>
              <p className="text-xs text-muted-foreground">{g.whyMatters}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab 4: Quiz ──────────────────────────────────────────────────────────────

type QuizMode = "quiz" | "flashcard" | "done";

function GreeksQuiz() {
  const awardXP = useGameStore((s) => s.awardXP);
  const [mode, setMode] = useState<QuizMode>("quiz");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUIZ_QUESTIONS.length).fill(null));
  const [flashIdx, setFlashIdx] = useState(0);
  const [showFlashAnswer, setShowFlashAnswer] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  const q = QUIZ_QUESTIONS[currentQ];

  const handleAnswer = useCallback(
    (idx: number) => {
      if (selected !== null) return;
      setSelected(idx);
      const newAnswers = [...answers];
      newAnswers[currentQ] = idx;
      setAnswers(newAnswers);
      if (idx === q.correct) {
        setScore((s) => s + 1);
      }
    },
    [selected, answers, currentQ, q.correct]
  );

  const handleNext = useCallback(() => {
    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
    } else {
      setMode("done");
    }
  }, [currentQ]);

  useEffect(() => {
    if (mode === "done" && !xpAwarded) {
      const xp = score * 15;
      awardXP(xp);
      setXpAwarded(true);
    }
  }, [mode, xpAwarded, score, awardXP]);

  const resetQuiz = () => {
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setAnswers(Array(QUIZ_QUESTIONS.length).fill(null));
    setXpAwarded(false);
    setMode("quiz");
  };

  if (mode === "done") {
    const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-6 py-12"
      >
        <div className="text-6xl">{pct >= 80 ? "🏆" : pct >= 60 ? "📈" : "📚"}</div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{score}/{QUIZ_QUESTIONS.length} Correct</p>
          <p className="text-muted-foreground mt-1">{pct}% — {pct >= 80 ? "Greek Master!" : pct >= 60 ? "Solid understanding" : "Keep studying!"}</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            +{score * 15} XP earned
          </span>
        </div>
        <div className="w-full max-w-md space-y-2">
          {QUIZ_QUESTIONS.map((question, i) => (
            <div
              key={question.id}
              className={`flex items-center gap-3 p-2 rounded-lg text-xs ${
                answers[i] === question.correct
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {answers[i] === question.correct ? (
                <Check className="size-3.5 shrink-0" />
              ) : (
                <X className="size-3.5 shrink-0" />
              )}
              <span>Q{i + 1}: {question.scenario.slice(0, 50)}…</span>
            </div>
          ))}
        </div>
        <button
          onClick={resetQuiz}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Retry Quiz
        </button>
      </motion.div>
    );
  }

  if (mode === "flashcard") {
    const fq = QUIZ_QUESTIONS[flashIdx];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Greek Flashcards</p>
          <div className="flex gap-2">
            <button
              onClick={() => setMode("quiz")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Switch to Quiz
            </button>
          </div>
        </div>
        <motion.div
          key={flashIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-border bg-card p-6 cursor-pointer min-h-[200px] flex flex-col justify-between"
          onClick={() => setShowFlashAnswer(!showFlashAnswer)}
        >
          <div>
            <p className="text-xs text-muted-foreground mb-3">Scenario</p>
            <p className="text-sm text-foreground">{fq.scenario}</p>
            <p className="text-sm font-semibold text-foreground mt-3">{fq.question}</p>
          </div>
          <AnimatePresence>
            {showFlashAnswer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-border"
              >
                <p className="text-xs text-muted-foreground mb-1">Answer</p>
                <p className="text-sm font-semibold text-green-400">{fq.choices[fq.correct]}</p>
                <p className="text-xs text-muted-foreground mt-2">{fq.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!showFlashAnswer && (
            <p className="text-xs text-muted-foreground text-center mt-4">Tap to reveal answer</p>
          )}
        </motion.div>
        <div className="flex gap-3 items-center justify-between">
          <button
            onClick={() => { setFlashIdx((i) => Math.max(0, i - 1)); setShowFlashAnswer(false); }}
            disabled={flashIdx === 0}
            className="px-3 py-1.5 rounded-lg bg-muted text-sm text-foreground disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-xs text-muted-foreground">{flashIdx + 1} / {QUIZ_QUESTIONS.length}</span>
          <button
            onClick={() => { setFlashIdx((i) => Math.min(QUIZ_QUESTIONS.length - 1, i + 1)); setShowFlashAnswer(false); }}
            disabled={flashIdx === QUIZ_QUESTIONS.length - 1}
            className="px-3 py-1.5 rounded-lg bg-muted text-sm text-foreground disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // Quiz mode
  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Q {currentQ + 1} / {QUIZ_QUESTIONS.length}
          </span>
          <div className="flex gap-1">
            {QUIZ_QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-4 rounded-full transition-colors ${
                  i < currentQ
                    ? answers[i] === QUIZ_QUESTIONS[i].correct
                      ? "bg-green-500"
                      : "bg-red-500"
                    : i === currentQ
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
        <button
          onClick={() => { setMode("flashcard"); setShowFlashAnswer(false); }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Brain className="size-3.5" />
          Flashcard mode
        </button>
      </div>

      {/* Score */}
      <div className="flex gap-2 items-center">
        <span className="text-xs text-muted-foreground">Score:</span>
        <span className="text-sm font-mono font-bold text-foreground">{score}</span>
        <Zap className="size-3.5 text-amber-400" />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground mb-2">Scenario</p>
            <p className="text-sm text-foreground mb-4">{q.scenario}</p>
            <p className="text-sm font-semibold text-foreground">{q.question}</p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {q.choices.map((choice, i) => {
              let cls =
                "w-full text-left p-3.5 rounded-xl border text-sm transition-all ";
              if (selected === null) {
                cls += "border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-foreground";
              } else if (i === q.correct) {
                cls += "border-green-500/50 bg-green-500/10 text-green-400";
              } else if (i === selected && selected !== q.correct) {
                cls += "border-red-500/50 bg-red-500/10 text-red-400";
              } else {
                cls += "border-border bg-card text-muted-foreground opacity-60";
              }
              return (
                <button key={i} className={cls} onClick={() => handleAnswer(i)}>
                  <span className="font-mono text-xs mr-2 opacity-60">{String.fromCharCode(65 + i)}.</span>
                  {choice}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-muted/50 p-4 space-y-2"
            >
              <div className="flex items-center gap-2">
                {selected === q.correct ? (
                  <Check className="size-4 text-green-400 shrink-0" />
                ) : (
                  <X className="size-4 text-red-400 shrink-0" />
                )}
                <p className="text-sm font-semibold text-foreground">
                  {selected === q.correct ? "Correct!" : "Not quite."}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{q.explanation}</p>
              <button
                onClick={handleNext}
                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                {currentQ < QUIZ_QUESTIONS.length - 1 ? "Next Question" : "See Results"}
                <ChevronRight className="size-3.5" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function GreeksPage() {
  // Shared slider state so Tab 2 and 3 react to Tab 1 changes
  const [params, setParams] = useState<SliderParams>({
    S: 100,
    K: 100,
    T: 30,
    sigma: 0.30,
    r: 0.05,
    isCall: true,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calculator className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Greeks Lab</h1>
            <p className="text-xs text-muted-foreground">Interactive Black-Scholes calculator and Greek visualizations</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="explorer" className="h-full">
          <div className="px-6 pt-4">
            <TabsList className="w-full">
              <TabsTrigger value="explorer" className="flex-1 flex items-center gap-1.5">
                <Calculator className="size-3.5" />
                Greeks Explorer
              </TabsTrigger>
              <TabsTrigger value="visualized" className="flex-1 flex items-center gap-1.5">
                <BarChart2 className="size-3.5" />
                Visualized
              </TabsTrigger>
              <TabsTrigger value="second-order" className="flex-1 flex items-center gap-1.5">
                <TrendingUp className="size-3.5" />
                Vanna & Charm
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex-1 flex items-center gap-1.5">
                <Brain className="size-3.5" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="simulator" className="flex-1 flex items-center gap-1.5">
                <FlaskConical className="size-3.5" />
                Advanced Simulator
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="explorer" className="px-6 py-4">
            <GreeksExplorer />
          </TabsContent>

          <TabsContent value="visualized" className="px-6 py-4">
            <GreeksVisualized params={params} />
          </TabsContent>

          <TabsContent value="second-order" className="px-6 py-4">
            <SecondOrderGreeksTab params={params} />
          </TabsContent>

          <TabsContent value="quiz" className="px-6 py-4">
            <GreeksQuiz />
          </TabsContent>

          <TabsContent value="simulator" className="px-6 py-4">
            <GreeksSimulator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
