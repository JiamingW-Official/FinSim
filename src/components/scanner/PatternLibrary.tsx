"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/stores/game-store";
import {
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  BarChart2,
  Shuffle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Trophy,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type PatternCategory = "Reversal" | "Continuation" | "Bilateral" | "Candlestick";
type SignalDirection = "bullish" | "bearish" | "bilateral";
type SortKey = "successRate" | "avgGain" | "name";

interface ChartPattern {
  id: string;
  name: string;
  category: PatternCategory;
  successRate: number; // %
  avgGain: number; // %
  avgFormationBars: number;
  signal: SignalDirection;
  description: string;
  entry: string;
  stop: string;
  target: string;
  volumeConfirmation: string;
  failureModes: string[];
  // SVG mini path data for 80×60 thumbnail
  miniSvg: React.ReactNode;
  // SVG for detail view (400×250)
  detailSvg: React.ReactNode;
  labels: { x: number; y: number; text: string }[];
}

// ─── Seeded PRNG (mulberry32) ─────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── SVG Mini Illustrations (80×60) ──────────────────────────────────────────

const MiniHeadAndShoulders = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <polyline points="5,50 15,35 22,40 32,20 42,40 50,32 60,45 75,45"
      fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
    <line x1="5" y1="43" x2="75" y2="43" stroke="currentColor" strokeWidth="0.8"
      strokeDasharray="3,2" className="text-rose-400" />
    <circle cx="32" cy="20" r="2" fill="currentColor" className="text-primary" />
  </svg>
);

const MiniDoubleTop = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <polyline points="5,50 20,22 35,50 50,22 65,50"
      fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
    <line x1="5" y1="50" x2="75" y2="50" stroke="currentColor" strokeWidth="0.8"
      strokeDasharray="3,2" className="text-rose-400" />
    <circle cx="20" cy="22" r="2" fill="currentColor" className="text-primary" />
    <circle cx="50" cy="22" r="2" fill="currentColor" className="text-primary" />
  </svg>
);

const MiniDoubleBottom = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <polyline points="5,10 20,38 35,10 50,38 65,10"
      fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400" />
    <line x1="5" y1="10" x2="75" y2="10" stroke="currentColor" strokeWidth="0.8"
      strokeDasharray="3,2" className="text-emerald-400" />
    <circle cx="20" cy="38" r="2" fill="currentColor" className="text-emerald-400" />
    <circle cx="50" cy="38" r="2" fill="currentColor" className="text-emerald-400" />
  </svg>
);

const MiniTripleTop = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <polyline points="5,50 15,22 25,44 37,22 50,44 62,22 72,50"
      fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
    <line x1="5" y1="50" x2="75" y2="50" stroke="currentColor" strokeWidth="0.8"
      strokeDasharray="3,2" className="text-rose-400" />
  </svg>
);

const MiniRoundingBottom = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <path d="M5,15 Q40,52 75,15" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400" />
    <line x1="60" y1="15" x2="75" y2="5" stroke="currentColor" strokeWidth="1.2" className="text-emerald-400" />
  </svg>
);

const MiniRisingWedge = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <line x1="5" y1="50" x2="70" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="2,1" className="text-muted-foreground" />
    <line x1="5" y1="42" x2="70" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="2,1" className="text-muted-foreground" />
    <polyline points="5,46 18,38 28,40 40,32 52,34 64,26"
      fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rose-400" />
    <line x1="64" y1="26" x2="75" y2="48" stroke="currentColor" strokeWidth="1.5" className="text-rose-400" />
  </svg>
);

const MiniBullFlag = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <line x1="10" y1="55" x2="10" y2="15" stroke="currentColor" strokeWidth="2" className="text-emerald-400" />
    <line x1="10" y1="15" x2="45" y2="15" stroke="currentColor" strokeWidth="1" strokeDasharray="2,1" className="text-muted-foreground" />
    <line x1="10" y1="22" x2="45" y2="22" stroke="currentColor" strokeWidth="1" strokeDasharray="2,1" className="text-muted-foreground" />
    <polyline points="10,18 22,20 33,17 44,19"
      fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
    <line x1="44" y1="18" x2="65" y2="5" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400" />
  </svg>
);

const MiniPennant = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <line x1="8" y1="55" x2="8" y2="15" stroke="currentColor" strokeWidth="2" className="text-emerald-400" />
    <line x1="8" y1="15" x2="42" y2="22" stroke="currentColor" strokeWidth="1" strokeDasharray="2,1" className="text-muted-foreground" />
    <line x1="8" y1="28" x2="42" y2="22" stroke="currentColor" strokeWidth="1" strokeDasharray="2,1" className="text-muted-foreground" />
    <polyline points="8,20 20,23 30,21 40,22"
      fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
    <line x1="40" y1="22" x2="65" y2="8" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400" />
  </svg>
);

const MiniRectangle = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <line x1="5" y1="20" x2="60" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="3,2" className="text-muted-foreground" />
    <line x1="5" y1="40" x2="60" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="3,2" className="text-muted-foreground" />
    <polyline points="5,30 15,22 22,38 30,22 38,38 48,22 55,38"
      fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
    <line x1="55" y1="28" x2="75" y2="12" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400" />
  </svg>
);

const MiniCupHandle = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <path d="M5,15 Q30,52 55,15" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
    <polyline points="55,15 62,22 68,18"
      fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
    <line x1="68" y1="18" x2="75" y2="8" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400" />
  </svg>
);

const MiniAscTriangle = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <line x1="5" y1="22" x2="68" y2="22" stroke="currentColor" strokeWidth="1" strokeDasharray="2,1" className="text-muted-foreground" />
    <line x1="5" y1="50" x2="68" y2="22" stroke="currentColor" strokeWidth="1" strokeDasharray="2,1" className="text-muted-foreground" />
    <polyline points="5,50 18,30 28,22 38,32 50,22 60,26"
      fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
    <line x1="60" y1="24" x2="75" y2="10" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400" />
  </svg>
);

const MiniDescTriangle = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <line x1="5" y1="40" x2="68" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="2,1" className="text-muted-foreground" />
    <line x1="5" y1="12" x2="68" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="2,1" className="text-muted-foreground" />
    <polyline points="5,12 18,30 28,40 38,28 50,40 60,35"
      fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
    <line x1="60" y1="38" x2="75" y2="52" stroke="currentColor" strokeWidth="1.5" className="text-rose-400" />
  </svg>
);

const MiniSymTriangle = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <line x1="5" y1="12" x2="65" y2="32" stroke="currentColor" strokeWidth="1" strokeDasharray="2,1" className="text-muted-foreground" />
    <line x1="5" y1="50" x2="65" y2="32" stroke="currentColor" strokeWidth="1" strokeDasharray="2,1" className="text-muted-foreground" />
    <polyline points="5,14 18,38 30,20 42,42 55,30 64,32"
      fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
  </svg>
);

const MiniDiamond = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <polyline points="10,30 25,10 40,5 55,10 68,30 55,50 40,55 25,50 10,30"
      fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2,1" className="text-muted-foreground" />
    <polyline points="10,30 25,18 38,12 50,18 60,30"
      fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
  </svg>
);

const MiniBroadening = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <line x1="10" y1="25" x2="68" y2="8" stroke="currentColor" strokeWidth="1" strokeDasharray="2,1" className="text-muted-foreground" />
    <line x1="10" y1="35" x2="68" y2="52" stroke="currentColor" strokeWidth="1" strokeDasharray="2,1" className="text-muted-foreground" />
    <polyline points="10,30 22,12 35,45 48,15 60,48"
      fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400" />
  </svg>
);

const MiniHammer = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <rect x="35" y="25" width="10" height="12" rx="1" fill="currentColor" className="text-emerald-400" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" />
    <line x1="40" y1="37" x2="40" y2="55" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400" />
    <line x1="40" y1="25" x2="40" y2="20" stroke="currentColor" strokeWidth="1" className="text-emerald-400" />
  </svg>
);

const MiniShootingStar = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <rect x="35" y="35" width="10" height="10" rx="1" fill="currentColor" className="text-rose-400" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" />
    <line x1="40" y1="35" x2="40" y2="10" stroke="currentColor" strokeWidth="1.5" className="text-rose-400" />
    <line x1="40" y1="45" x2="40" y2="50" stroke="currentColor" strokeWidth="1" className="text-rose-400" />
  </svg>
);

const MiniDoji = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <line x1="40" y1="12" x2="40" y2="50" stroke="currentColor" strokeWidth="1.2" className="text-amber-400" />
    <line x1="30" y1="30" x2="50" y2="30" stroke="currentColor" strokeWidth="2" className="text-amber-400" />
  </svg>
);

const MiniBullEngulf = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <rect x="25" y="25" width="12" height="18" rx="1" fill="currentColor" className="text-rose-400" fillOpacity="0.4" stroke="currentColor" strokeWidth="1" />
    <rect x="42" y="18" width="14" height="28" rx="1" fill="currentColor" className="text-emerald-400" fillOpacity="0.5" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const MiniMorningStar = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <rect x="10" y="18" width="12" height="22" rx="1" fill="currentColor" className="text-rose-400" fillOpacity="0.4" stroke="currentColor" strokeWidth="1" />
    <rect x="28" y="38" width="8" height="6" rx="1" fill="currentColor" className="text-amber-400" fillOpacity="0.6" stroke="currentColor" strokeWidth="1" />
    <rect x="42" y="16" width="14" height="26" rx="1" fill="currentColor" className="text-emerald-400" fillOpacity="0.5" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const MiniEveningStar = () => (
  <svg viewBox="0 0 80 60" className="h-full w-full">
    <rect x="10" y="20" width="12" height="22" rx="1" fill="currentColor" className="text-emerald-400" fillOpacity="0.4" stroke="currentColor" strokeWidth="1" />
    <rect x="28" y="14" width="8" height="6" rx="1" fill="currentColor" className="text-amber-400" fillOpacity="0.6" stroke="currentColor" strokeWidth="1" />
    <rect x="42" y="20" width="14" height="24" rx="1" fill="currentColor" className="text-rose-400" fillOpacity="0.5" stroke="currentColor" strokeWidth="1" />
  </svg>
);

// ─── Detail SVG Illustrations (400×250) ──────────────────────────────────────

const DetailHeadAndShoulders = () => (
  <svg viewBox="0 0 400 250" className="h-full w-full">
    <polyline points="20,210 60,150 95,170 150,80 205,165 240,135 295,195 380,195"
      fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
    {/* Neckline */}
    <line x1="20" y1="185" x2="380" y2="185" stroke="currentColor" strokeWidth="1.2"
      strokeDasharray="6,4" className="text-rose-400" />
    {/* Breakout arrow */}
    <line x1="295" y1="185" x2="295" y2="220" stroke="currentColor" strokeWidth="2" className="text-rose-400" />
    <polygon points="295,230 289,215 301,215" fill="currentColor" className="text-rose-400" />
    {/* Labels */}
    <text x="60" y="143" fontSize="9" fill="currentColor" textAnchor="middle" className="text-muted-foreground fill-zinc-400">L. Shoulder</text>
    <text x="150" y="72" fontSize="9" fill="currentColor" textAnchor="middle" className="text-muted-foreground fill-zinc-400">Head</text>
    <text x="240" y="128" fontSize="9" fill="currentColor" textAnchor="middle" className="text-muted-foreground fill-zinc-400">R. Shoulder</text>
    <text x="340" y="180" fontSize="9" fill="currentColor" className="fill-rose-400">Neckline</text>
    <text x="310" y="240" fontSize="9" fill="currentColor" className="fill-rose-400">Breakout</text>
    {/* Target */}
    <line x1="295" y1="185" x2="380" y2="185" stroke="currentColor" strokeWidth="1" strokeDasharray="3,2" className="text-amber-400" />
    <text x="335" y="210" fontSize="9" fill="currentColor" className="fill-amber-400">Target</text>
  </svg>
);

const DetailDoubleTop = () => (
  <svg viewBox="0 0 400 250" className="h-full w-full">
    <polyline points="20,200 80,90 160,200 240,90 320,200"
      fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
    <line x1="20" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="1.2"
      strokeDasharray="6,4" className="text-rose-400" />
    <line x1="320" y1="200" x2="320" y2="235" stroke="currentColor" strokeWidth="2" className="text-rose-400" />
    <polygon points="320,242 314,228 326,228" fill="currentColor" className="text-rose-400" />
    <text x="80" y="82" fontSize="10" fill="currentColor" textAnchor="middle" className="fill-zinc-400">Peak 1</text>
    <text x="240" y="82" fontSize="10" fill="currentColor" textAnchor="middle" className="fill-zinc-400">Peak 2</text>
    <text x="360" y="195" fontSize="9" fill="currentColor" className="fill-rose-400">Support</text>
    <text x="335" y="242" fontSize="9" fill="currentColor" className="fill-rose-400">Break</text>
  </svg>
);

const DetailCupHandle = () => (
  <svg viewBox="0 0 400 250" className="h-full w-full">
    {/* Cup */}
    <path d="M20,60 Q150,230 290,60" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
    {/* Handle */}
    <polyline points="290,60 320,95 350,75"
      fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
    {/* Breakout */}
    <line x1="350" y1="75" x2="390" y2="30" stroke="currentColor" strokeWidth="2" className="text-emerald-400" />
    <polygon points="390,22 383,38 397,35" fill="currentColor" className="text-emerald-400" />
    {/* Rim line */}
    <line x1="20" y1="60" x2="360" y2="60" stroke="currentColor" strokeWidth="1"
      strokeDasharray="4,3" className="text-muted-foreground" />
    <text x="155" y="240" fontSize="10" fill="currentColor" textAnchor="middle" className="fill-zinc-400">Cup Bottom</text>
    <text x="20" y="52" fontSize="9" fill="currentColor" className="fill-zinc-400">Left rim</text>
    <text x="270" y="52" fontSize="9" fill="currentColor" className="fill-zinc-400">Right rim</text>
    <text x="320" y="115" fontSize="9" fill="currentColor" className="fill-zinc-400">Handle</text>
    <text x="370" y="25" fontSize="9" fill="currentColor" className="fill-emerald-400">Breakout</text>
  </svg>
);

const DetailBullFlag = () => (
  <svg viewBox="0 0 400 250" className="h-full w-full">
    {/* Pole */}
    <line x1="60" y1="230" x2="60" y2="60" stroke="currentColor" strokeWidth="3" className="text-emerald-400" />
    {/* Flag channel */}
    <line x1="60" y1="60" x2="220" y2="80" stroke="currentColor" strokeWidth="1" strokeDasharray="4,3" className="text-muted-foreground" />
    <line x1="60" y1="95" x2="220" y2="115" stroke="currentColor" strokeWidth="1" strokeDasharray="4,3" className="text-muted-foreground" />
    {/* Price in flag */}
    <polyline points="60,75 90,85 120,78 155,90 185,82 215,92"
      fill="none" stroke="currentColor" strokeWidth="1.8" className="text-primary" />
    {/* Breakout */}
    <line x1="215" y1="88" x2="340" y2="30" stroke="currentColor" strokeWidth="2" className="text-emerald-400" />
    <polygon points="340,22 333,38 347,36" fill="currentColor" className="text-emerald-400" />
    {/* Target */}
    <line x1="340" y1="30" x2="390" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="3,2" className="text-amber-400" />
    <text x="55" y="250" fontSize="9" fill="currentColor" className="fill-zinc-400">Pole</text>
    <text x="130" y="72" fontSize="9" fill="currentColor" className="fill-zinc-400">Flag</text>
    <text x="270" y="22" fontSize="9" fill="currentColor" className="fill-emerald-400">Breakout</text>
    <text x="355" y="26" fontSize="9" fill="currentColor" className="fill-amber-400">Target</text>
  </svg>
);

const DetailSymTriangle = () => (
  <svg viewBox="0 0 400 250" className="h-full w-full">
    <line x1="20" y1="40" x2="260" y2="125" stroke="currentColor" strokeWidth="1.2" strokeDasharray="5,3" className="text-muted-foreground" />
    <line x1="20" y1="210" x2="260" y2="125" stroke="currentColor" strokeWidth="1.2" strokeDasharray="5,3" className="text-muted-foreground" />
    <polyline points="20,45 70,175 115,68 165,182 205,95 245,128"
      fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
    <line x1="245" y1="128" x2="350" y2="60" stroke="currentColor" strokeWidth="2" className="text-emerald-400" />
    <polygon points="355,56 341,66 349,72" fill="currentColor" className="text-emerald-400" />
    <text x="20" y="32" fontSize="9" fill="currentColor" className="fill-zinc-400">Resistance line</text>
    <text x="20" y="228" fontSize="9" fill="currentColor" className="fill-zinc-400">Support line</text>
    <text x="320" y="52" fontSize="9" fill="currentColor" className="fill-emerald-400">Breakout</text>
    <text x="250" y="118" fontSize="9" fill="currentColor" className="fill-zinc-400">Apex</text>
  </svg>
);

// Generic fallback detail SVG
const DetailGeneric = ({ color = "text-primary" }: { color?: string }) => (
  <svg viewBox="0 0 400 250" className="h-full w-full">
    <polyline points="20,200 80,140 140,180 200,100 260,160 320,120 380,80"
      fill="none" stroke="currentColor" strokeWidth="2" className={color} />
    <line x1="20" y1="180" x2="380" y2="180" stroke="currentColor" strokeWidth="1"
      strokeDasharray="5,3" className="text-muted-foreground" />
  </svg>
);

// ─── Pattern Data ─────────────────────────────────────────────────────────────

const PATTERNS: ChartPattern[] = [
  {
    id: "head_shoulders",
    name: "Head & Shoulders",
    category: "Reversal",
    successRate: 83,
    avgGain: 22,
    avgFormationBars: 45,
    signal: "bearish",
    description: "Three peaks with the middle (head) highest. Classic topping pattern after an uptrend.",
    entry: "Short on close below neckline; or on retest of neckline from below",
    stop: "Above the right shoulder high",
    target: "Neckline minus the height from neckline to head",
    volumeConfirmation: "Volume should be highest on left shoulder, lower on head, lowest on right shoulder. Volume spikes on neckline break.",
    failureModes: ["Right shoulder fails to form", "Neckline slopes too steeply", "Volume pattern not confirmed", "Breaks out above head instead"],
    miniSvg: <MiniHeadAndShoulders />,
    detailSvg: <DetailHeadAndShoulders />,
    labels: [],
  },
  {
    id: "double_top",
    name: "Double Top",
    category: "Reversal",
    successRate: 78,
    avgGain: 18,
    avgFormationBars: 30,
    signal: "bearish",
    description: "Two peaks at the same resistance level. Strong reversal signal when support breaks.",
    entry: "Short on break below the valley between the two peaks",
    stop: "Above both peaks",
    target: "Support minus the height of the pattern",
    volumeConfirmation: "First peak on high volume, second peak on lower volume confirms weakness",
    failureModes: ["Price bounces off support instead of breaking", "Second peak exceeds first (no longer double top)", "Too short a gap between peaks"],
    miniSvg: <MiniDoubleTop />,
    detailSvg: <DetailDoubleTop />,
    labels: [],
  },
  {
    id: "double_bottom",
    name: "Double Bottom",
    category: "Reversal",
    successRate: 76,
    avgGain: 20,
    avgFormationBars: 28,
    signal: "bullish",
    description: "Two troughs at the same support level. Bullish reversal after downtrend.",
    entry: "Long on break above the peak between the two troughs",
    stop: "Below both troughs",
    target: "Resistance plus the height of the pattern",
    volumeConfirmation: "Second bottom on lower volume shows exhaustion of selling. Volume spike on breakout.",
    failureModes: ["Price fails to break resistance", "Second bottom undercuts first", "Shallow pattern with tight range"],
    miniSvg: <MiniDoubleBottom />,
    detailSvg: <DetailGeneric color="text-emerald-400" />,
    labels: [],
  },
  {
    id: "triple_top",
    name: "Triple Top",
    category: "Reversal",
    successRate: 80,
    avgGain: 19,
    avgFormationBars: 55,
    signal: "bearish",
    description: "Three failed attempts at the same resistance. High-conviction bearish reversal.",
    entry: "Short on break below the lowest valley",
    stop: "Above the three peaks",
    target: "Support minus full pattern height",
    volumeConfirmation: "Declining volume on each successive peak. High volume on breakdown.",
    failureModes: ["Takes too long — pattern loses relevance", "Any peak breaks above resistance level"],
    miniSvg: <MiniTripleTop />,
    detailSvg: <DetailGeneric color="text-rose-400" />,
    labels: [],
  },
  {
    id: "rounding_bottom",
    name: "Rounding Bottom",
    category: "Reversal",
    successRate: 74,
    avgGain: 25,
    avgFormationBars: 90,
    signal: "bullish",
    description: "Slow, gradual U-shaped reversal. Often seen in longer-term charts at major bottoms.",
    entry: "Long on break above the left rim high",
    stop: "Below the midpoint of the cup",
    target: "Height of the bowl added to breakout level",
    volumeConfirmation: "Volume mirrors price: high at start, dries up at bottom, expands on right side",
    failureModes: ["V-shaped recovery instead of rounding", "Fails to reclaim left rim level"],
    miniSvg: <MiniRoundingBottom />,
    detailSvg: <DetailGeneric color="text-emerald-400" />,
    labels: [],
  },
  {
    id: "rising_wedge",
    name: "Rising Wedge",
    category: "Reversal",
    successRate: 73,
    avgGain: 17,
    avgFormationBars: 35,
    signal: "bearish",
    description: "Price compresses upward with converging trendlines. Despite rising, it's bearish.",
    entry: "Short on close below lower trendline",
    stop: "Above the most recent swing high inside the wedge",
    target: "Back to the origin of the wedge",
    volumeConfirmation: "Volume declines as the wedge forms — key warning sign",
    failureModes: ["Breakout to the upside", "Wedge too steep (more like a channel)"],
    miniSvg: <MiniRisingWedge />,
    detailSvg: <DetailGeneric color="text-rose-400" />,
    labels: [],
  },
  {
    id: "bull_flag",
    name: "Bull Flag",
    category: "Continuation",
    successRate: 85,
    avgGain: 16,
    avgFormationBars: 12,
    signal: "bullish",
    description: "Sharp rally (pole) followed by brief consolidation (flag). Continuation of the uptrend.",
    entry: "Long on break above the upper flag boundary",
    stop: "Below the lower flag trendline",
    target: "Pole height added to breakout point",
    volumeConfirmation: "Volume surges on pole, dries up during flag, explodes on breakout",
    failureModes: ["Flag drops more than 50% of pole", "Breakout on weak volume", "Flag channel too wide"],
    miniSvg: <MiniBullFlag />,
    detailSvg: <DetailBullFlag />,
    labels: [],
  },
  {
    id: "pennant",
    name: "Pennant",
    category: "Continuation",
    successRate: 82,
    avgGain: 15,
    avgFormationBars: 10,
    signal: "bullish",
    description: "Sharp move followed by symmetrical triangle consolidation. High momentum continuation.",
    entry: "Long on breakout above the apex",
    stop: "Below the pennant low",
    target: "Pole length projected from breakout",
    volumeConfirmation: "High volume on the initial pole, contracting during pennant formation",
    failureModes: ["Pennant forms over too many bars", "No clear pole preceding it"],
    miniSvg: <MiniPennant />,
    detailSvg: <DetailGeneric color="text-emerald-400" />,
    labels: [],
  },
  {
    id: "rectangle",
    name: "Rectangle",
    category: "Continuation",
    successRate: 71,
    avgGain: 12,
    avgFormationBars: 25,
    signal: "bullish",
    description: "Sideways consolidation between two horizontal levels. Break in trend direction continues move.",
    entry: "Long on break above resistance (or short on break below support)",
    stop: "Opposite side of the rectangle",
    target: "Rectangle height projected from breakout",
    volumeConfirmation: "Volume drops during rectangle, spikes on the breakout",
    failureModes: ["False breakout is common — wait for close", "Too many touches of same level can erode it"],
    miniSvg: <MiniRectangle />,
    detailSvg: <DetailGeneric />,
    labels: [],
  },
  {
    id: "cup_handle",
    name: "Cup & Handle",
    category: "Continuation",
    successRate: 81,
    avgGain: 28,
    avgFormationBars: 65,
    signal: "bullish",
    description: "Rounded base (cup) followed by small pullback (handle). Institutional accumulation pattern.",
    entry: "Long on handle breakout above the right rim",
    stop: "Below the handle low",
    target: "Cup depth projected upward from breakout",
    volumeConfirmation: "Volume dries up in handle, surges on breakout",
    failureModes: ["Handle drops more than ⅓ of cup depth", "V-shaped cup instead of rounded", "No true handle forms"],
    miniSvg: <MiniCupHandle />,
    detailSvg: <DetailCupHandle />,
    labels: [],
  },
  {
    id: "asc_triangle",
    name: "Ascending Triangle",
    category: "Continuation",
    successRate: 77,
    avgGain: 14,
    avgFormationBars: 30,
    signal: "bullish",
    description: "Flat resistance with rising lows. Bulls pressing against ceiling — breakout is likely.",
    entry: "Long on close above flat resistance",
    stop: "Below the last swing low (rising support)",
    target: "Pattern height added to breakout level",
    volumeConfirmation: "Volume contracts into the apex, expands strongly on breakout",
    failureModes: ["Break below rising support (pattern fails)", "Resistance level is penetrated, not broken cleanly"],
    miniSvg: <MiniAscTriangle />,
    detailSvg: <DetailGeneric color="text-emerald-400" />,
    labels: [],
  },
  {
    id: "desc_triangle",
    name: "Descending Triangle",
    category: "Continuation",
    successRate: 75,
    avgGain: 13,
    avgFormationBars: 28,
    signal: "bearish",
    description: "Flat support with declining highs. Bears pressing down — bearish breakdown expected.",
    entry: "Short on close below flat support",
    stop: "Above the last swing high (descending resistance)",
    target: "Pattern height subtracted from breakdown level",
    volumeConfirmation: "Volume contracts approaching apex, spikes on breakdown",
    failureModes: ["Breaks above descending trendline", "Support holds and price reverses up"],
    miniSvg: <MiniDescTriangle />,
    detailSvg: <DetailGeneric color="text-rose-400" />,
    labels: [],
  },
  {
    id: "sym_triangle",
    name: "Symmetrical Triangle",
    category: "Bilateral",
    successRate: 68,
    avgGain: 11,
    avgFormationBars: 35,
    signal: "bilateral",
    description: "Converging trendlines with no directional bias. Can break either way — wait for the move.",
    entry: "Long/short on confirmed breakout from either side",
    stop: "Opposite trendline from breakout direction",
    target: "Widest part of triangle projected from breakout",
    volumeConfirmation: "Volume must expand significantly on the breakout — no volume, no signal",
    failureModes: ["False breakouts are very common", "Price breakout but immediately reverses"],
    miniSvg: <MiniSymTriangle />,
    detailSvg: <DetailSymTriangle />,
    labels: [],
  },
  {
    id: "diamond",
    name: "Diamond Pattern",
    category: "Bilateral",
    successRate: 70,
    avgGain: 21,
    avgFormationBars: 50,
    signal: "bilateral",
    description: "Broadening then narrowing price action. Rare but powerful reversal or continuation signal.",
    entry: "Trade the break of the final narrowing side",
    stop: "Center of the diamond",
    target: "Full height of the diamond from breakout",
    volumeConfirmation: "Volume is irregular — expansion on the breakdown/breakout side matters most",
    failureModes: ["Pattern is often misidentified", "Takes too long to complete", "False breaks at the edges"],
    miniSvg: <MiniDiamond />,
    detailSvg: <DetailGeneric />,
    labels: [],
  },
  {
    id: "broadening",
    name: "Broadening Pattern",
    category: "Bilateral",
    successRate: 62,
    avgGain: 14,
    avgFormationBars: 40,
    signal: "bilateral",
    description: "Expanding price action with no convergence. Volatile and unpredictable — trade breaks only.",
    entry: "Fade the extremes or trade the final breakdown/breakout",
    stop: "Outside the latest swing extreme",
    target: "Previous swing extreme or 1× pattern height",
    volumeConfirmation: "Volume tends to expand with each successive swing",
    failureModes: ["No clear breakout — just continues expanding", "Very high failure rate in trending markets"],
    miniSvg: <MiniBroadening />,
    detailSvg: <DetailGeneric color="text-amber-400" />,
    labels: [],
  },
  {
    id: "hammer",
    name: "Hammer",
    category: "Candlestick",
    successRate: 72,
    avgGain: 8,
    avgFormationBars: 1,
    signal: "bullish",
    description: "Small body at top, long lower wick. Buyers rejected lower prices — bullish reversal signal.",
    entry: "Long on next candle open, or buy above hammer high",
    stop: "Below hammer low",
    target: "1.5–2× the hammer range",
    volumeConfirmation: "High volume on hammer candle increases reliability significantly",
    failureModes: ["No follow-through on next candle", "Appears in uptrend (becomes a Hanging Man, bearish)"],
    miniSvg: <MiniHammer />,
    detailSvg: <DetailGeneric color="text-emerald-400" />,
    labels: [],
  },
  {
    id: "shooting_star",
    name: "Shooting Star",
    category: "Candlestick",
    successRate: 70,
    avgGain: 7,
    avgFormationBars: 1,
    signal: "bearish",
    description: "Small body at bottom, long upper wick. Sellers rejected higher prices — bearish reversal.",
    entry: "Short on next candle open, or below shooting star low",
    stop: "Above shooting star high",
    target: "1.5–2× the star range",
    volumeConfirmation: "Higher volume adds conviction to the rejection signal",
    failureModes: ["No bearish follow-through", "Appears in downtrend (becomes Inverted Hammer, bullish)"],
    miniSvg: <MiniShootingStar />,
    detailSvg: <DetailGeneric color="text-rose-400" />,
    labels: [],
  },
  {
    id: "doji",
    name: "Doji",
    category: "Candlestick",
    successRate: 58,
    avgGain: 5,
    avgFormationBars: 1,
    signal: "bilateral",
    description: "Open and close are equal. Perfect indecision — next candle direction determines bias.",
    entry: "Wait for the next candle to confirm direction",
    stop: "Outside the wick of the doji",
    target: "Use support/resistance for targets",
    volumeConfirmation: "Low volume doji is more neutral; high volume doji at extremes is more meaningful",
    failureModes: ["Very low success without context", "Need surrounding price action to interpret"],
    miniSvg: <MiniDoji />,
    detailSvg: <DetailGeneric color="text-amber-400" />,
    labels: [],
  },
  {
    id: "engulfing",
    name: "Bullish Engulfing",
    category: "Candlestick",
    successRate: 74,
    avgGain: 9,
    avgFormationBars: 2,
    signal: "bullish",
    description: "Large bullish candle completely engulfs prior bearish candle. Strong reversal at bottoms.",
    entry: "Long on next candle open",
    stop: "Below the low of the engulfing candle",
    target: "Prior swing high; or 2× the engulfing body height",
    volumeConfirmation: "Engulfing candle should have much higher volume than the prior candle",
    failureModes: ["Appears mid-trend (less reliable)", "Small body difference reduces signal quality"],
    miniSvg: <MiniBullEngulf />,
    detailSvg: <DetailGeneric color="text-emerald-400" />,
    labels: [],
  },
  {
    id: "morning_star",
    name: "Morning Star",
    category: "Candlestick",
    successRate: 79,
    avgGain: 11,
    avgFormationBars: 3,
    signal: "bullish",
    description: "Three-candle bottom reversal: bearish, small doji/star, then large bullish candle.",
    entry: "Long on close or open of third bullish candle",
    stop: "Below the low of the star (middle) candle",
    target: "Prior swing high; or height of the third candle × 2",
    volumeConfirmation: "Third candle on significantly higher volume greatly increases reliability",
    failureModes: ["Third candle fails to close above midpoint of first candle", "Pattern appears mid-trend"],
    miniSvg: <MiniMorningStar />,
    detailSvg: <DetailGeneric color="text-emerald-400" />,
    labels: [],
  },
  {
    id: "evening_star",
    name: "Evening Star",
    category: "Candlestick",
    successRate: 77,
    avgGain: 10,
    avgFormationBars: 3,
    signal: "bearish",
    description: "Three-candle top reversal: bullish, small doji/star, then large bearish candle.",
    entry: "Short on close or open of third bearish candle",
    stop: "Above the high of the star (middle) candle",
    target: "Prior swing low; or height of third candle × 2",
    volumeConfirmation: "Third bearish candle on high volume confirms supply entering the market",
    failureModes: ["Third candle shallow — doesn't penetrate first candle's body", "Needs prior uptrend to be valid"],
    miniSvg: <MiniEveningStar />,
    detailSvg: <DetailGeneric color="text-rose-400" />,
    labels: [],
  },
];

// ─── Utility helpers ──────────────────────────────────────────────────────────

function categoryColor(cat: PatternCategory) {
  if (cat === "Reversal") return "text-rose-400 bg-rose-400/10";
  if (cat === "Continuation") return "text-emerald-400 bg-emerald-400/10";
  if (cat === "Bilateral") return "text-amber-400 bg-amber-400/10";
  return "text-primary bg-primary/10";
}

function signalColor(signal: SignalDirection) {
  if (signal === "bullish") return "text-emerald-400";
  if (signal === "bearish") return "text-rose-400";
  return "text-amber-400";
}

function SignalIcon({ signal }: { signal: SignalDirection }) {
  if (signal === "bullish") return <TrendingUp className="h-3 w-3 text-emerald-400" />;
  if (signal === "bearish") return <TrendingDown className="h-3 w-3 text-rose-400" />;
  return <Minus className="h-3 w-3 text-amber-400" />;
}

// ─── Pattern Card ─────────────────────────────────────────────────────────────

function PatternCard({
  pattern,
  onClick,
}: {
  pattern: ChartPattern;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-lg border border-border/50 bg-card text-left transition-colors hover:border-primary/40 hover:bg-accent/20"
      style={{ width: 200, minHeight: 160 }}
    >
      {/* SVG thumb */}
      <div className="flex items-center justify-center border-b border-border/30 bg-muted/20"
        style={{ width: 200, height: 90 }}>
        <div style={{ width: 80, height: 60 }} className="text-foreground">
          {pattern.miniSvg}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <p className="text-[11px] font-semibold leading-tight text-foreground">{pattern.name}</p>
        <div className="flex flex-wrap items-center gap-1">
          <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", categoryColor(pattern.category))}>
            {pattern.category}
          </span>
          <span className={cn("flex items-center gap-0.5 text-[11px] font-medium", signalColor(pattern.signal))}>
            <SignalIcon signal={pattern.signal} />
            {pattern.signal.charAt(0).toUpperCase() + pattern.signal.slice(1)}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="text-center">
            <p className="text-xs font-bold tabular-nums text-emerald-400">{pattern.successRate}%</p>
            <p className="text-[8px] text-muted-foreground">Success</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold tabular-nums text-primary">+{pattern.avgGain}%</p>
            <p className="text-[8px] text-muted-foreground">Avg Gain</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold tabular-nums text-foreground">{pattern.avgFormationBars}</p>
            <p className="text-[8px] text-muted-foreground">Bars</p>
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Pattern Detail View ──────────────────────────────────────────────────────

function PatternDetail({
  pattern,
  onBack,
}: {
  pattern: ChartPattern;
  onBack: () => void;
}) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-md border border-border/50 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <div>
          <h2 className="text-sm font-semibold text-foreground">{pattern.name}</h2>
          <div className="mt-0.5 flex items-center gap-2">
            <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", categoryColor(pattern.category))}>
              {pattern.category}
            </span>
            <span className={cn("flex items-center gap-0.5 text-[11px] font-medium", signalColor(pattern.signal))}>
              <SignalIcon signal={pattern.signal} />
              {pattern.signal.charAt(0).toUpperCase() + pattern.signal.slice(1)}
            </span>
          </div>
        </div>
        <div className="ml-auto flex gap-4 text-center">
          <div>
            <p className="text-sm font-bold tabular-nums text-emerald-400">{pattern.successRate}%</p>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </div>
          <div>
            <p className="text-sm font-bold tabular-nums text-primary">+{pattern.avgGain}%</p>
            <p className="text-xs text-muted-foreground">Avg Gain</p>
          </div>
          <div>
            <p className="text-sm font-bold tabular-nums text-foreground">{pattern.avgFormationBars}</p>
            <p className="text-xs text-muted-foreground">Avg Bars</p>
          </div>
        </div>
      </div>

      {/* Large SVG */}
      <div className="overflow-hidden rounded-lg border border-border/40 bg-muted/10" style={{ height: 250 }}>
        <div className="h-full w-full text-foreground">
          {pattern.detailSvg}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{pattern.description}</p>

      {/* How to trade grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Entry", value: pattern.entry, color: "text-emerald-400", bg: "bg-emerald-400/5 border-emerald-400/20" },
          { label: "Stop Loss", value: pattern.stop, color: "text-rose-400", bg: "bg-rose-400/5 border-rose-400/20" },
          { label: "Target", value: pattern.target, color: "text-amber-400", bg: "bg-amber-400/5 border-amber-400/20" },
        ].map((item) => (
          <div key={item.label} className={cn("rounded-lg border p-3", item.bg)}>
            <p className={cn("mb-1 text-xs font-semibold", item.color)}>{item.label}</p>
            <p className="text-[11px] text-foreground/80 leading-snug">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Volume confirmation */}
      <div className="rounded-lg border border-border bg-primary/5 p-3">
        <p className="mb-1 text-xs font-semibold text-primary">Volume Confirmation</p>
        <p className="text-[11px] text-foreground/80 leading-snug">{pattern.volumeConfirmation}</p>
      </div>

      {/* Failure modes */}
      <div className="rounded-lg border border-rose-400/20 bg-rose-400/5 p-3">
        <p className="mb-2 text-xs font-semibold text-rose-400">Failure Modes</p>
        <ul className="space-y-1">
          {pattern.failureModes.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] text-foreground/80">
              <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-rose-400" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Section 3: Quiz ──────────────────────────────────────────────────────────

const QUIZ_POOL: { pattern: ChartPattern; options: string[] }[] = PATTERNS.map((p) => {
  const others = PATTERNS.filter((x) => x.id !== p.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .map((x) => x.name);
  const options = [p.name, ...others].sort(() => 0.5 - Math.random());
  return { pattern: p, options };
});

interface QuizQuestion {
  pattern: ChartPattern;
  options: string[];
}

function buildQuiz(seed: number): QuizQuestion[] {
  const rand = mulberry32(seed);
  const shuffled = [...QUIZ_POOL].sort(() => rand() - 0.5);
  return shuffled.slice(0, 10).map((q) => {
    // Re-shuffle options with seed
    const opts = [...q.options].sort(() => rand() - 0.5);
    return { pattern: q.pattern, options: opts };
  });
}

type QuizMode = "idle" | "quiz" | "flashcard" | "done";

function QuizSection() {
  const awardXP = useGameStore((s) => s.awardXP);
  const [mode, setMode] = useState<QuizMode>("idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [flashIdx, setFlashIdx] = useState(0);
  const seedRef = useRef(Date.now());

  const startQuiz = useCallback(() => {
    const q = buildQuiz(seedRef.current);
    setQuestions(q);
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setXpAwarded(false);
    setMode("quiz");
    seedRef.current = Date.now();
  }, []);

  const startFlash = useCallback(() => {
    setFlashIdx(0);
    setMode("flashcard");
  }, []);

  const handleAnswer = useCallback(
    (opt: string) => {
      if (selected !== null) return;
      setSelected(opt);
      const correct = opt === questions[qIndex].pattern.name;
      if (correct) setScore((s) => s + 1);
    },
    [selected, questions, qIndex],
  );

  const handleNext = useCallback(() => {
    if (qIndex + 1 >= questions.length) {
      setMode("done");
      // Award XP if not already
      if (!xpAwarded) {
        const earned = score * 5 + (score === 10 ? 50 : 0);
        if (earned > 0) awardXP(earned);
        setXpAwarded(true);
      }
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  }, [qIndex, questions.length, score, xpAwarded, awardXP]);

  if (mode === "idle") {
    return (
      <div className="flex flex-col items-center gap-6 py-10 text-center">
        <BookOpen className="h-10 w-10 text-primary/60" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Pattern Recognition Quiz</h3>
          <p className="mt-1 text-xs text-muted-foreground">Test your ability to identify 10 chart patterns. Earn XP for correct answers.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={startQuiz}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Start Quiz (10 Q)
          </button>
          <button
            type="button"
            onClick={startFlash}
            className="inline-flex items-center gap-2 rounded-md border border-border/50 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Shuffle className="h-3.5 w-3.5" />
            Flash Cards
          </button>
        </div>
      </div>
    );
  }

  if (mode === "flashcard") {
    const p = PATTERNS[flashIdx % PATTERNS.length];
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="flex w-full max-w-sm items-center justify-between">
          <p className="text-xs text-muted-foreground">{flashIdx + 1} / {PATTERNS.length}</p>
          <button type="button" onClick={() => setMode("idle")} className="text-[11px] text-muted-foreground hover:text-foreground">Exit</button>
        </div>
        <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border/50 bg-card">
          <div className="flex h-40 items-center justify-center border-b border-border/30 bg-muted/20">
            <div style={{ width: 120, height: 90 }} className="text-foreground">{p.miniSvg}</div>
          </div>
          <div className="p-4 text-center">
            <p className="text-sm font-semibold text-foreground">{p.name}</p>
            <span className={cn("mt-1 inline-block rounded px-1.5 py-0.5 text-[11px] font-medium", categoryColor(p.category))}>
              {p.category}
            </span>
            <p className="mt-2 text-[11px] text-muted-foreground leading-snug">{p.description}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFlashIdx((i) => (i - 1 + PATTERNS.length) % PATTERNS.length)}
            className="rounded-md border border-border/50 px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setFlashIdx((i) => (i + 1) % PATTERNS.length)}
            className="rounded-md bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  if (mode === "done") {
    const pct = Math.round((score / 10) * 100);
    const grade = pct >= 90 ? "A" : pct >= 70 ? "B" : pct >= 50 ? "C" : "D";
    const xpEarned = score * 5 + (score === 10 ? 50 : 0);
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <Trophy className={cn("h-10 w-10", pct >= 70 ? "text-amber-400" : "text-muted-foreground/40")} />
        <div>
          <p className="text-2xl font-bold text-foreground">{grade}</p>
          <p className="text-sm text-muted-foreground">{score} / 10 correct ({pct}%)</p>
          {xpEarned > 0 && (
            <p className="mt-1 text-xs text-primary">+{xpEarned} XP earned</p>
          )}
        </div>
        <button
          type="button"
          onClick={startQuiz}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Quiz mode
  const q = questions[qIndex];
  const correct = q.pattern.name;
  return (
    <div className="mx-auto max-w-lg space-y-5 py-4">
      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((qIndex) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{qIndex + 1} / {questions.length}</span>
        <span className="text-xs font-medium text-emerald-400">{score} correct</span>
      </div>

      <p className="text-center text-xs text-muted-foreground">What chart pattern is this?</p>

      {/* Pattern display */}
      <div className="flex justify-center">
        <div className="flex items-center justify-center overflow-hidden rounded-xl border border-border/40 bg-muted/20"
          style={{ width: 200, height: 150 }}>
          <div style={{ width: 140, height: 105 }} className="text-foreground">{q.pattern.miniSvg}</div>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt) => {
          const isSelected = selected === opt;
          const isCorrect = opt === correct;
          const revealed = selected !== null;
          return (
            <button
              key={opt}
              type="button"
              disabled={revealed}
              onClick={() => handleAnswer(opt)}
              className={cn(
                "rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition-colors",
                !revealed && "border-border/50 text-foreground hover:border-primary/40 hover:bg-accent/20",
                revealed && isCorrect && "border-emerald-400/60 bg-emerald-400/10 text-emerald-400",
                revealed && isSelected && !isCorrect && "border-rose-400/60 bg-rose-400/10 text-rose-400",
                revealed && !isSelected && !isCorrect && "border-border/30 text-muted-foreground",
              )}
            >
              <span className="flex items-center gap-2">
                {revealed && isCorrect && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />}
                {revealed && isSelected && !isCorrect && <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />}
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            {qIndex + 1 >= questions.length ? "See Results" : "Next"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Section 4: Statistics Dashboard ─────────────────────────────────────────

const MARKET_MATRIX: {
  pattern: string;
  bull: number;
  bear: number;
  sideways: number;
}[] = [
  { pattern: "Cup & Handle",      bull: 88, bear: 32, sideways: 55 },
  { pattern: "Bull Flag",         bull: 85, bear: 28, sideways: 50 },
  { pattern: "Head & Shoulders",  bull: 72, bear: 90, sideways: 60 },
  { pattern: "Double Bottom",     bull: 80, bear: 82, sideways: 65 },
  { pattern: "Ascending Triangle",bull: 82, bear: 30, sideways: 58 },
  { pattern: "Symmetrical Tri.",  bull: 60, bear: 62, sideways: 68 },
  { pattern: "Rectangle",         bull: 72, bear: 68, sideways: 80 },
  { pattern: "Morning Star",      bull: 70, bear: 82, sideways: 55 },
];

const SECTOR_PATTERNS: { sector: string; bestPattern: string; winRate: number }[] = [
  { sector: "Technology",   bestPattern: "Cup & Handle",       winRate: 84 },
  { sector: "Energy",       bestPattern: "Bull Flag",           winRate: 79 },
  { sector: "Financials",   bestPattern: "Ascending Triangle",  winRate: 76 },
  { sector: "Healthcare",   bestPattern: "Double Bottom",       winRate: 74 },
  { sector: "Consumer",     bestPattern: "Rectangle",           winRate: 71 },
  { sector: "Industrials",  bestPattern: "Pennant",             winRate: 73 },
];

function StatsDashboard() {
  // Seeded "current market" top 3
  const rand = mulberry32(7070);
  const sorted = [...PATTERNS]
    .map((p) => ({ p, score: rand() * 30 + p.successRate }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Sort by success rate for bar chart
  const barData = [...PATTERNS].sort((a, b) => b.successRate - a.successRate);
  const maxRate = Math.max(...barData.map((p) => p.successRate));

  return (
    <div className="space-y-6">
      {/* Best patterns right now */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="mb-3 text-xs font-semibold text-primary">
          Best Patterns Right Now (Current Market Regime)
        </p>
        <div className="flex gap-3">
          {sorted.map(({ p }, rank) => (
            <div key={p.id} className="flex flex-1 items-center gap-2 rounded-md border border-border/40 bg-card px-3 py-2">
              <span className="text-sm font-bold text-muted-foreground">#{rank + 1}</span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{p.name}</p>
                <p className="text-xs text-emerald-400">{p.successRate}% success</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Rate Bar Chart */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Success Rate by Pattern</p>
        <div className="overflow-hidden rounded-lg border border-border/40 bg-card p-4">
          <svg viewBox={`0 0 600 ${barData.length * 22 + 10}`} className="w-full">
            {barData.map((p, i) => {
              const barW = (p.successRate / maxRate) * 380;
              const y = i * 22 + 5;
              const barColor = p.successRate >= 80 ? "#34d399" : p.successRate >= 70 ? "#fbbf24" : "#94a3b8";
              return (
                <g key={p.id}>
                  <text x="0" y={y + 12} fontSize="8" fill="#94a3b8" dominantBaseline="middle">
                    {p.name.length > 18 ? p.name.slice(0, 17) + "…" : p.name}
                  </text>
                  <rect x="160" y={y + 3} width={barW} height="13" rx="3" fill={barColor} fillOpacity="0.7" />
                  <text x={barW + 165} y={y + 12} fontSize="8" fill={barColor} dominantBaseline="middle">
                    {p.successRate}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Market condition matrix */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Market Condition Matrix</p>
        <div className="overflow-hidden rounded-lg border border-border/40">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Pattern</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-emerald-400">Bull Market</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-rose-400">Bear Market</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-amber-400">Sideways</th>
              </tr>
            </thead>
            <tbody>
              {MARKET_MATRIX.map((row, i) => (
                <tr key={i} className="border-b border-border/20 last:border-0">
                  <td className="px-3 py-2 text-[11px] text-foreground/80">{row.pattern}</td>
                  {[row.bull, row.bear, row.sideways].map((v, j) => (
                    <td key={j} className="px-3 py-2 text-center">
                      <span className={cn(
                        "text-xs font-semibold tabular-nums",
                        v >= 75 ? "text-emerald-400" : v >= 55 ? "text-amber-400" : "text-rose-400"
                      )}>{v}%</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sector performance */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Best Pattern by Sector</p>
        <div className="grid grid-cols-2 gap-2">
          {SECTOR_PATTERNS.map((s) => (
            <div key={s.sector} className="flex items-center gap-3 rounded-lg border border-border/40 bg-card px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">{s.sector}</p>
                <p className="truncate text-[11px] font-semibold text-foreground">{s.bestPattern}</p>
              </div>
              <span className="text-xs font-bold text-emerald-400">{s.winRate}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main PatternLibrary Component ────────────────────────────────────────────

type LibrarySection = "gallery" | "stats" | "quiz";
type CategoryFilter = "All" | PatternCategory;

export function PatternLibrary() {
  const [section, setSection] = useState<LibrarySection>("gallery");
  const [selectedPattern, setSelectedPattern] = useState<ChartPattern | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [sortKey, setSortKey] = useState<SortKey>("successRate");

  const categories: CategoryFilter[] = ["All", "Reversal", "Continuation", "Bilateral", "Candlestick"];

  const filtered = useMemo(() => {
    let list = PATTERNS;
    if (categoryFilter !== "All") {
      list = list.filter((p) => p.category === categoryFilter);
    }
    return [...list].sort((a, b) => {
      if (sortKey === "successRate") return b.successRate - a.successRate;
      if (sortKey === "avgGain") return b.avgGain - a.avgGain;
      return a.name.localeCompare(b.name);
    });
  }, [categoryFilter, sortKey]);

  const SECTIONS = [
    { id: "gallery" as LibrarySection, label: "Pattern Gallery" },
    { id: "stats" as LibrarySection, label: "Statistics" },
    { id: "quiz" as LibrarySection, label: "Quiz" },
  ];

  return (
    <div className="space-y-4">
      {/* Section tabs */}
      <div className="flex gap-1 rounded-lg border border-border/40 bg-muted/20 p-1">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => { setSection(s.id); setSelectedPattern(null); }}
            className={cn(
              "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
              section === s.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Gallery Section */}
      {section === "gallery" && (
        <>
          {selectedPattern ? (
            <PatternDetail pattern={selectedPattern} onBack={() => setSelectedPattern(null)} />
          ) : (
            <>
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-1 rounded-md border border-border/50 p-0.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={cn(
                        "rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
                        categoryFilter === cat
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Sort:</span>
                  <div className="flex gap-1 rounded-md border border-border/50 p-0.5">
                    {(["successRate", "avgGain", "name"] as SortKey[]).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setSortKey(k)}
                        className={cn(
                          "rounded px-2 py-1 text-xs font-medium transition-colors",
                          sortKey === k
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {k === "successRate" ? "Success %" : k === "avgGain" ? "Avg Gain" : "Name"}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{filtered.length} patterns</span>
                </div>
              </div>

              {/* Grid */}
              <div className="flex flex-wrap gap-3">
                {filtered.map((p) => (
                  <PatternCard key={p.id} pattern={p} onClick={() => setSelectedPattern(p)} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Stats Section */}
      {section === "stats" && <StatsDashboard />}

      {/* Quiz Section */}
      {section === "quiz" && <QuizSection />}
    </div>
  );
}
