"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Zap,
  Star,
  BookOpen,
  ScanLine,
  PlusCircle,
  Filter,
  Trophy,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Seeded PRNG (mulberry32) ──────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

type PatternCategory = "Reversal" | "Continuation" | "Bilateral";
type BreakoutDirection = "Bullish" | "Bearish" | "Either";
type MarketCondition = "Bull Market" | "Bear Market" | "Sideways";

interface ChartPattern {
  id: string;
  name: string;
  category: PatternCategory;
  reliability: number;
  breakoutDir: BreakoutDirection;
  timeframe: string;
  description: string;
  entryTrigger: string;
  stopLoss: string;
  targetProjection: string;
  svgPoints: string; // polyline points for main price action
  svgExtra?: string; // additional SVG elements (neckline, etc.)
  winRateBull: number;
  winRateBear: number;
  winRateSide: number;
  avgMove: number;
}

interface ScanResult {
  ticker: string;
  company: string;
  pattern: string;
  confidence: number;
  stage: "forming" | "confirmed";
  volumeConfirm: boolean;
  category: PatternCategory;
  reliability: number;
  svgPoints: string;
}

interface QuizQuestion {
  patternId: string;
  patternName: string;
  options: string[];
  correctIndex: number;
  svgPoints: string;
  explanation: string;
}

// ── Pattern Data ──────────────────────────────────────────────────────────────

const PATTERNS: ChartPattern[] = [
  // ── Reversal ────────────────────────────────────────────────────────────────
  {
    id: "hs",
    name: "Head & Shoulders",
    category: "Reversal",
    reliability: 83,
    breakoutDir: "Bearish",
    timeframe: "Daily / Weekly",
    description:
      "A topping pattern with three peaks: a higher central peak (head) flanked by two lower peaks (shoulders). Forms after an uptrend, signaling a trend reversal to the downside.",
    entryTrigger: "Enter short when price closes below the neckline (line connecting the two troughs between the shoulders and head).",
    stopLoss: "Place stop above the right shoulder high.",
    targetProjection: "Measure head-to-neckline distance and project downward from the neckline break.",
    svgPoints: "5,65 20,48 35,30 50,48 65,15 80,48 95,65 110,65",
    svgExtra: '<line x1="5" y1="65" x2="115" y2="65" stroke="#6366f1" stroke-width="1" stroke-dasharray="3,2"/>',
    winRateBull: 62, winRateBear: 78, winRateSide: 68, avgMove: 14,
  },
  {
    id: "ihs",
    name: "Inverse Head & Shoulders",
    category: "Reversal",
    reliability: 82,
    breakoutDir: "Bullish",
    timeframe: "Daily / Weekly",
    description:
      "Mirror of H&S: three troughs with a deeper central trough (head). Forms after a downtrend, signaling a bullish reversal.",
    entryTrigger: "Enter long when price closes above the neckline.",
    stopLoss: "Place stop below the right shoulder low.",
    targetProjection: "Measure head-to-neckline distance and project upward from neckline breakout.",
    svgPoints: "5,20 20,38 35,55 50,38 65,72 80,38 95,20 110,20",
    svgExtra: '<line x1="5" y1="20" x2="115" y2="20" stroke="#10b981" stroke-width="1" stroke-dasharray="3,2"/>',
    winRateBull: 79, winRateBear: 63, winRateSide: 70, avgMove: 15,
  },
  {
    id: "dt",
    name: "Double Top",
    category: "Reversal",
    reliability: 75,
    breakoutDir: "Bearish",
    timeframe: "Daily",
    description:
      "Two roughly equal highs separated by a pullback trough. Price fails to make a new high on the second attempt, indicating exhaustion of buying pressure.",
    entryTrigger: "Enter short on a confirmed close below the trough low (confirmation level).",
    stopLoss: "Stop above the second peak high.",
    targetProjection: "Measure peak-to-trough distance and project downward from the confirmation level.",
    svgPoints: "5,70 20,40 35,55 50,38 65,56 80,38 95,70 110,78",
    svgExtra: '<line x1="35" y1="55" x2="65" y2="55" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,2"/>',
    winRateBull: 58, winRateBear: 74, winRateSide: 65, avgMove: 11,
  },
  {
    id: "db",
    name: "Double Bottom",
    category: "Reversal",
    reliability: 76,
    breakoutDir: "Bullish",
    timeframe: "Daily",
    description:
      "Two roughly equal lows with a peak between them. Price fails to set a new low on the second test, signaling a bullish reversal.",
    entryTrigger: "Enter long on a confirmed close above the peak high (confirmation level).",
    stopLoss: "Stop below the second trough low.",
    targetProjection: "Measure trough-to-peak distance and project upward from the confirmation level.",
    svgPoints: "5,20 20,55 35,35 50,58 65,36 80,55 95,25 110,18",
    svgExtra: '<line x1="35" y1="35" x2="65" y2="35" stroke="#10b981" stroke-width="1" stroke-dasharray="3,2"/>',
    winRateBull: 75, winRateBear: 56, winRateSide: 64, avgMove: 12,
  },
  {
    id: "tt",
    name: "Triple Top",
    category: "Reversal",
    reliability: 77,
    breakoutDir: "Bearish",
    timeframe: "Daily / Weekly",
    description:
      "Three peaks at approximately the same price level. Each failed breakout attempt adds conviction to the resistance zone, leading to a decisive breakdown.",
    entryTrigger: "Enter short on close below the support connecting the two troughs.",
    stopLoss: "Above any of the three peaks.",
    targetProjection: "Measure peaks-to-support distance and project downward from support break.",
    svgPoints: "5,72 18,40 30,60 43,38 57,60 70,40 85,60 98,72 112,78",
    svgExtra: '<line x1="5" y1="60" x2="112" y2="60" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,2"/>',
    winRateBull: 55, winRateBear: 76, winRateSide: 63, avgMove: 13,
  },
  {
    id: "tb",
    name: "Triple Bottom",
    category: "Reversal",
    reliability: 78,
    breakoutDir: "Bullish",
    timeframe: "Daily / Weekly",
    description:
      "Three troughs at approximately the same price level, each representing a failed breakdown. Strong demand zone leads to bullish reversal.",
    entryTrigger: "Enter long on close above the resistance connecting the two peaks.",
    stopLoss: "Below any of the three troughs.",
    targetProjection: "Measure troughs-to-resistance distance and project upward from resistance break.",
    svgPoints: "5,20 18,55 30,30 43,58 57,30 70,55 85,30 98,20 112,15",
    svgExtra: '<line x1="5" y1="30" x2="112" y2="30" stroke="#10b981" stroke-width="1" stroke-dasharray="3,2"/>',
    winRateBull: 76, winRateBear: 55, winRateSide: 64, avgMove: 14,
  },
  {
    id: "rb",
    name: "Rounding Bottom",
    category: "Reversal",
    reliability: 72,
    breakoutDir: "Bullish",
    timeframe: "Weekly / Monthly",
    description:
      "A long, gradual U-shaped base indicating a slow shift in sentiment from bearish to bullish. Also called a 'saucer bottom.' Often seen after prolonged downtrends.",
    entryTrigger: "Enter long when price breaks above the rim (the high before the rounded base began).",
    stopLoss: "Below the midpoint of the rounding base.",
    targetProjection: "Measure the depth of the base and project upward from the rim breakout.",
    svgPoints: "5,25 15,38 25,50 35,60 50,68 65,60 75,50 85,38 95,28 110,20",
    winRateBull: 70, winRateBear: 52, winRateSide: 61, avgMove: 18,
  },
  {
    id: "ir",
    name: "Island Reversal",
    category: "Reversal",
    reliability: 79,
    breakoutDir: "Either",
    timeframe: "Daily",
    description:
      "A cluster of candles isolated by two gaps (gap up, then gap down — or vice versa). Creates an 'island' of price action, signaling sharp exhaustion.",
    entryTrigger: "Enter on the second gap (the gap that creates the island), confirmed by volume.",
    stopLoss: "Above/below the island cluster.",
    targetProjection: "Often returns to the origin of the first gap; target the pre-gap zone.",
    svgPoints: "5,55 20,45 35,40 44,30 50,28 56,30 62,32 70,55 85,65 100,70 112,72",
    svgExtra: '<line x1="44" y1="10" x2="44" y2="30" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2,2"/><line x1="62" y1="32" x2="62" y2="52" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2,2"/>',
    winRateBull: 64, winRateBear: 72, winRateSide: 60, avgMove: 10,
  },

  // ── Continuation ─────────────────────────────────────────────────────────────
  {
    id: "bf",
    name: "Bull Flag",
    category: "Continuation",
    reliability: 68,
    breakoutDir: "Bullish",
    timeframe: "Daily / Intraday",
    description:
      "A sharp upward move (flagpole) followed by a tight, parallel downward channel (flag). The brief consolidation sets up a continuation of the prior uptrend.",
    entryTrigger: "Enter long on breakout above the upper flag channel line.",
    stopLoss: "Below the lower flag channel line.",
    targetProjection: "Add the flagpole length to the breakout point.",
    svgPoints: "5,72 15,55 25,38 35,22 45,30 55,38 65,32 75,40 85,32 95,22 110,10",
    svgExtra: '<line x1="42" y1="22" x2="90" y2="42" stroke="#10b981" stroke-width="1" stroke-dasharray="2,2"/><line x1="42" y1="32" x2="90" y2="52" stroke="#10b981" stroke-width="1" stroke-dasharray="2,2"/>',
    winRateBull: 67, winRateBear: 45, winRateSide: 55, avgMove: 9,
  },
  {
    id: "brf",
    name: "Bear Flag",
    category: "Continuation",
    reliability: 67,
    breakoutDir: "Bearish",
    timeframe: "Daily / Intraday",
    description:
      "A sharp downward move (flagpole) followed by a tight, parallel upward channel (flag). The pullback relief rally sets up a continuation of the downtrend.",
    entryTrigger: "Enter short on breakdown below the lower flag channel line.",
    stopLoss: "Above the upper flag channel line.",
    targetProjection: "Subtract the flagpole length from the breakdown point.",
    svgPoints: "5,15 15,30 25,48 35,65 45,58 55,50 65,56 75,48 85,54 95,65 110,78",
    svgExtra: '<line x1="42" y1="50" x2="90" y2="40" stroke="#ef4444" stroke-width="1" stroke-dasharray="2,2"/><line x1="42" y1="62" x2="90" y2="52" stroke="#ef4444" stroke-width="1" stroke-dasharray="2,2"/>',
    winRateBull: 44, winRateBear: 66, winRateSide: 53, avgMove: 9,
  },
  {
    id: "at",
    name: "Ascending Triangle",
    category: "Continuation",
    reliability: 72,
    breakoutDir: "Bullish",
    timeframe: "Daily",
    description:
      "A flat horizontal resistance line and a rising support line forming a triangle. Buyers become more aggressive at each pullback, compressing price until the resistance breaks.",
    entryTrigger: "Enter long on a confirmed close above the flat resistance line.",
    stopLoss: "Below the most recent higher low within the triangle.",
    targetProjection: "Add the triangle's maximum height to the breakout level.",
    svgPoints: "5,70 20,55 35,65 50,48 65,60 80,42 95,55 110,40",
    svgExtra: '<line x1="5" y1="40" x2="115" y2="40" stroke="#10b981" stroke-width="1" stroke-dasharray="3,2"/><line x1="5" y1="70" x2="115" y2="42" stroke="#6366f1" stroke-width="1" stroke-dasharray="3,2"/>',
    winRateBull: 71, winRateBear: 52, winRateSide: 60, avgMove: 10,
  },
  {
    id: "dtr",
    name: "Descending Triangle",
    category: "Continuation",
    reliability: 73,
    breakoutDir: "Bearish",
    timeframe: "Daily",
    description:
      "A flat horizontal support line and a falling resistance line. Sellers consistently cap rallies at lower highs, compressing price until support breaks.",
    entryTrigger: "Enter short on a confirmed close below the flat support line.",
    stopLoss: "Above the most recent lower high within the triangle.",
    targetProjection: "Subtract the triangle's maximum height from the breakdown level.",
    svgPoints: "5,18 20,42 35,28 50,50 65,35 80,55 95,42 110,60",
    svgExtra: '<line x1="5" y1="60" x2="115" y2="60" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,2"/><line x1="5" y1="18" x2="115" y2="56" stroke="#6366f1" stroke-width="1" stroke-dasharray="3,2"/>',
    winRateBull: 51, winRateBear: 73, winRateSide: 61, avgMove: 10,
  },
  {
    id: "sym",
    name: "Symmetrical Triangle",
    category: "Continuation",
    reliability: 66,
    breakoutDir: "Either",
    timeframe: "Daily / Weekly",
    description:
      "Converging trendlines with lower highs and higher lows. Neither buyers nor sellers dominate. Breakout direction aligns with the prior trend.",
    entryTrigger: "Enter in the direction of the breakout candle, confirmed on close.",
    stopLoss: "Opposite side of the triangle at the time of entry.",
    targetProjection: "Add/subtract the widest part of the triangle from the breakout point.",
    svgPoints: "5,20 20,38 35,28 50,45 65,33 80,42 95,36 110,40",
    svgExtra: '<line x1="5" y1="20" x2="115" y2="40" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,2"/><line x1="5" y1="68" x2="115" y2="40" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,2"/>',
    winRateBull: 63, winRateBear: 62, winRateSide: 58, avgMove: 8,
  },
  {
    id: "ch",
    name: "Cup & Handle",
    category: "Continuation",
    reliability: 74,
    breakoutDir: "Bullish",
    timeframe: "Weekly / Daily",
    description:
      "A rounded U-shaped base (cup) followed by a slight downward drift (handle). Classic continuation pattern popularized by William O'Neil for growth stocks.",
    entryTrigger: "Enter long on breakout above the handle's resistance and prior cup rim.",
    stopLoss: "Below the low of the handle.",
    targetProjection: "Add the depth of the cup to the breakout level.",
    svgPoints: "5,22 15,32 25,45 35,58 50,65 65,58 75,45 85,32 95,28 102,35 108,28 112,22",
    winRateBull: 73, winRateBear: 48, winRateSide: 60, avgMove: 16,
  },
  {
    id: "pen",
    name: "Pennant",
    category: "Continuation",
    reliability: 69,
    breakoutDir: "Bullish",
    timeframe: "Daily / Intraday",
    description:
      "Similar to a flag but with converging trendlines forming a small symmetrical triangle instead of a channel. Short-term continuation after a sharp move.",
    entryTrigger: "Enter on breakout from the pennant in the direction of the prior move.",
    stopLoss: "Below the lowest point of the pennant.",
    targetProjection: "Add the prior move (flagpole) to the breakout level.",
    svgPoints: "5,70 15,52 25,35 35,22 45,30 55,25 65,28 75,25 85,26 95,22 110,12",
    svgExtra: '<line x1="38" y1="22" x2="92" y2="28" stroke="#10b981" stroke-width="1" stroke-dasharray="2,2"/><line x1="38" y1="32" x2="92" y2="24" stroke="#10b981" stroke-width="1" stroke-dasharray="2,2"/>',
    winRateBull: 68, winRateBear: 47, winRateSide: 56, avgMove: 9,
  },
  {
    id: "wed",
    name: "Wedge",
    category: "Continuation",
    reliability: 71,
    breakoutDir: "Either",
    timeframe: "Daily",
    description:
      "Two converging trendlines both sloping in the same direction. A rising wedge is bearish (breaks down); a falling wedge is bullish (breaks up). Counter-trend continuation.",
    entryTrigger: "For rising wedge: enter short on close below lower trendline. For falling wedge: enter long on close above upper trendline.",
    stopLoss: "Above/below the most recent swing inside the wedge.",
    targetProjection: "Return to the origin of the wedge.",
    svgPoints: "5,65 20,50 35,38 50,28 65,20 80,15 95,18 110,24",
    svgExtra: '<line x1="5" y1="65" x2="115" y2="15" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,2"/><line x1="5" y1="55" x2="115" y2="22" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,2"/>',
    winRateBull: 55, winRateBear: 70, winRateSide: 62, avgMove: 11,
  },

  // ── Bilateral ────────────────────────────────────────────────────────────────
  {
    id: "rect",
    name: "Rectangle",
    category: "Bilateral",
    reliability: 65,
    breakoutDir: "Either",
    timeframe: "Daily / Weekly",
    description:
      "Price consolidates between a horizontal support and resistance, creating a range-bound rectangle. Breakout direction determines the trade.",
    entryTrigger: "Enter on a confirmed close above resistance (bullish) or below support (bearish).",
    stopLoss: "Opposite boundary of the rectangle.",
    targetProjection: "Add/subtract the height of the rectangle from the breakout level.",
    svgPoints: "5,55 20,42 35,55 50,42 65,55 80,40 95,53 110,40",
    svgExtra: '<line x1="5" y1="40" x2="115" y2="40" stroke="#6366f1" stroke-width="1" stroke-dasharray="3,2"/><line x1="5" y1="57" x2="115" y2="57" stroke="#6366f1" stroke-width="1" stroke-dasharray="3,2"/>',
    winRateBull: 64, winRateBear: 63, winRateSide: 59, avgMove: 8,
  },
  {
    id: "dia",
    name: "Diamond",
    category: "Bilateral",
    reliability: 70,
    breakoutDir: "Either",
    timeframe: "Daily / Weekly",
    description:
      "A broadening formation followed by a narrowing, forming a diamond shape on the chart. Often occurs at tops or bottoms and signals a significant reversal or continuation.",
    entryTrigger: "Enter on close outside either trendline of the diamond's right side.",
    stopLoss: "Opposite side of the diamond at entry.",
    targetProjection: "Measure the widest point of the diamond and project from the breakout.",
    svgPoints: "5,40 20,28 35,15 50,28 65,40 80,28 95,15 110,28 115,40",
    svgExtra: '<line x1="5" y1="40" x2="65" y2="8" stroke="#8b5cf6" stroke-width="1" stroke-dasharray="2,2"/><line x1="5" y1="40" x2="65" y2="68" stroke="#8b5cf6" stroke-width="1" stroke-dasharray="2,2"/><line x1="65" y1="8" x2="115" y2="40" stroke="#8b5cf6" stroke-width="1" stroke-dasharray="2,2"/><line x1="65" y1="68" x2="115" y2="40" stroke="#8b5cf6" stroke-width="1" stroke-dasharray="2,2"/>',
    winRateBull: 67, winRateBear: 68, winRateSide: 62, avgMove: 12,
  },
  {
    id: "broad",
    name: "Broadening Formation",
    category: "Bilateral",
    reliability: 62,
    breakoutDir: "Either",
    timeframe: "Daily / Weekly",
    description:
      "Diverging trendlines with higher highs and lower lows — the opposite of a symmetrical triangle. Signals increased volatility and indecision. Often a topping signal.",
    entryTrigger: "Enter on a decisive close outside one of the diverging trendlines with strong volume.",
    stopLoss: "Re-entry into the pattern — if price returns inside, exit.",
    targetProjection: "Equal to the widest point of the formation projected from breakout.",
    svgPoints: "5,40 20,30 35,50 50,22 65,58 80,15 95,65 110,10",
    svgExtra: '<line x1="5" y1="30" x2="115" y2="8" stroke="#f97316" stroke-width="1" stroke-dasharray="2,2"/><line x1="5" y1="50" x2="115" y2="72" stroke="#f97316" stroke-width="1" stroke-dasharray="2,2"/>',
    winRateBull: 60, winRateBear: 61, winRateSide: 55, avgMove: 10,
  },
  {
    id: "mm",
    name: "Measured Move",
    category: "Bilateral",
    reliability: 67,
    breakoutDir: "Either",
    timeframe: "Daily",
    description:
      "A three-leg pattern: an initial impulse leg, a corrective leg, and a final leg roughly equal to the first impulse. Provides a mathematical price target.",
    entryTrigger: "Enter at the end of the corrective leg when the new impulse begins.",
    stopLoss: "Below the start of the correction for bullish, above for bearish.",
    targetProjection: "Project Leg 1 length from the end of the corrective leg.",
    svgPoints: "5,70 20,45 35,22 45,35 55,48 65,35 80,15 95,8 110,5",
    svgExtra: '<line x1="5" y1="70" x2="35" y2="22" stroke="#14b8a6" stroke-width="1" stroke-dasharray="2,2"/><line x1="65" y1="35" x2="110" y2="5" stroke="#14b8a6" stroke-width="1" stroke-dasharray="2,2"/>',
    winRateBull: 66, winRateBear: 65, winRateSide: 58, avgMove: 13,
  },
];

// ── Pattern SVG Component ─────────────────────────────────────────────────────

function PatternSVG({
  points,
  extra,
  width = 120,
  height = 80,
  strokeColor = "#6366f1",
}: {
  points: string;
  extra?: string;
  width?: number;
  height?: number;
  strokeColor?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="overflow-visible"
    >
      {/* Grid */}
      {[20, 40, 60].map((y) => (
        <line key={y} x1="0" y1={y} x2={width} y2={y} stroke="#ffffff08" strokeWidth="0.5" />
      ))}
      {extra && <g dangerouslySetInnerHTML={{ __html: extra }} />}
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Gradient fill below line */}
      <defs>
        <linearGradient id={`grad-${strokeColor.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.15" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Category color helpers ────────────────────────────────────────────────────

function categoryColor(cat: PatternCategory) {
  if (cat === "Reversal") return "text-red-400 bg-red-400/10 border-red-400/20";
  if (cat === "Continuation") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  return "text-amber-400 bg-amber-400/10 border-amber-400/20";
}

function dirIcon(dir: BreakoutDirection) {
  if (dir === "Bullish") return <TrendingUp className="h-3 w-3 text-emerald-400" />;
  if (dir === "Bearish") return <TrendingDown className="h-3 w-3 text-red-400" />;
  return <Minus className="h-3 w-3 text-amber-400" />;
}

function svgColor(dir: BreakoutDirection) {
  if (dir === "Bullish") return "#10b981";
  if (dir === "Bearish") return "#ef4444";
  return "#6366f1";
}

// ── TAB 1: Pattern Library ────────────────────────────────────────────────────

function PatternLibraryTab() {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<PatternCategory | "All">("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return PATTERNS.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === "All" || p.category === filterCat;
      return matchSearch && matchCat;
    });
  }, [search, filterCat]);

  return (
    <div className="space-y-4">
      {/* Search + Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search patterns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500"
          />
        </div>
        {(["All", "Reversal", "Continuation", "Bilateral"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
              filterCat === cat
                ? "bg-indigo-600 border-indigo-500 text-foreground"
                : "bg-card border-border text-muted-foreground hover:border-border"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} patterns</p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filtered.map((pattern) => {
          const isExpanded = expandedId === pattern.id;
          return (
            <motion.div
              key={pattern.id}
              layout
              className={cn(
                "rounded-md border bg-card/60 overflow-hidden cursor-pointer transition-colors",
                isExpanded
                  ? "border-indigo-500/50 col-span-1"
                  : "border-border hover:border-border"
              )}
              onClick={() => setExpandedId(isExpanded ? null : pattern.id)}
            >
              {/* Card header */}
              <div className="p-4 pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{pattern.name}</h3>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border mt-1",
                        categoryColor(pattern.category)
                      )}
                    >
                      {pattern.category}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {dirIcon(pattern.breakoutDir)}
                      <span>{pattern.breakoutDir}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{pattern.timeframe}</span>
                  </div>
                </div>

                {/* SVG illustration */}
                <div className="flex justify-center py-2">
                  <PatternSVG
                    points={pattern.svgPoints}
                    extra={pattern.svgExtra}
                    strokeColor={svgColor(pattern.breakoutDir)}
                  />
                </div>

                {/* Reliability bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Reliability</span>
                    <span className="text-muted-foreground font-medium">{pattern.reliability}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-indigo-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pattern.reliability}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">
                    Avg move: <span className="text-muted-foreground">~{pattern.avgMove}%</span>
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                      <p className="text-xs text-muted-foreground leading-relaxed">{pattern.description}</p>
                      <div className="space-y-2">
                        <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-900/30">
                          <p className="text-xs font-medium text-emerald-400 mb-0.5">Entry Trigger</p>
                          <p className="text-xs text-muted-foreground">{pattern.entryTrigger}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-red-950/40 border border-red-900/30">
                          <p className="text-xs font-medium text-red-400 mb-0.5">Stop Loss</p>
                          <p className="text-xs text-muted-foreground">{pattern.stopLoss}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-900/30">
                          <p className="text-xs font-medium text-indigo-400 mb-0.5">Target Projection</p>
                          <p className="text-xs text-muted-foreground">{pattern.targetProjection}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Quiz question generator ───────────────────────────────────────────────────

function buildQuizPool(rng: () => number): QuizQuestion[] {
  const allNames = PATTERNS.map((p) => p.name);

  return PATTERNS.slice(0, 10).map((pattern) => {
    // Pick 3 wrong options
    const wrong = allNames
      .filter((n) => n !== pattern.name)
      .sort(() => rng() - 0.5)
      .slice(0, 3);
    const options = [...wrong, pattern.name].sort(() => rng() - 0.5);
    const correctIndex = options.indexOf(pattern.name);

    // Slightly distort the SVG points for the quiz display
    const basePoints = pattern.svgPoints.split(" ").map((pt) => {
      const [x, y] = pt.split(",").map(Number);
      return `${x},${Math.max(5, Math.min(75, y + (rng() - 0.5) * 4))}`;
    });

    return {
      patternId: pattern.id,
      patternName: pattern.name,
      options,
      correctIndex,
      svgPoints: basePoints.join(" "),
      explanation: `${pattern.name} is a ${pattern.category.toLowerCase()} pattern with ${pattern.reliability}% reliability. ${pattern.description.split(".")[0]}.`,
    };
  });
}

// ── TAB 2: Pattern Quiz ───────────────────────────────────────────────────────

function PatternQuizTab() {
  const [rng] = useState(() => mulberry32(0xdeadbeef));
  const [quizPool] = useState(() => buildQuizPool(rng));
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [done, setDone] = useState(false);

  const question = quizPool[currentQ];

  const handleAnswer = useCallback(
    (idx: number) => {
      if (selected !== null) return;
      setSelected(idx);
      setTotal((t) => t + 1);
      const correct = idx === question.correctIndex;
      if (correct) {
        setScore((s) => s + 1);
        setStreak((s) => s + 1);
        const xp = 10 + streak * 5;
        setXpEarned((x) => x + xp);
      } else {
        setStreak(0);
      }
    },
    [selected, question.correctIndex, streak]
  );

  const handleNext = useCallback(() => {
    if (currentQ >= quizPool.length - 1) {
      setDone(true);
    } else {
      setCurrentQ((q) => q + 1);
      setSelected(null);
    }
  }, [currentQ, quizPool.length]);

  const handleRestart = useCallback(() => {
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setTotal(0);
    setStreak(0);
    setXpEarned(0);
    setDone(false);
  }, []);

  if (done) {
    const pct = Math.round((score / total) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 space-y-6"
      >
        <div className="text-6xl">{pct >= 80 ? "🏆" : pct >= 60 ? "⭐" : "📚"}</div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Quiz Complete!</h2>
          <p className="text-muted-foreground mt-1">
            You scored {score}/{total} ({pct}%)
          </p>
        </div>
        <div className="flex gap-6">
          <div className="text-center p-4 rounded-md bg-card border border-border">
            <p className="text-2xl font-bold text-indigo-400">+{xpEarned}</p>
            <p className="text-xs text-muted-foreground mt-1">XP Earned</p>
          </div>
          <div className="text-center p-4 rounded-md bg-card border border-border">
            <p className="text-2xl font-bold text-emerald-400">{score}</p>
            <p className="text-xs text-muted-foreground mt-1">Correct</p>
          </div>
          <div className="text-center p-4 rounded-md bg-card border border-border">
            <p className="text-2xl font-bold text-amber-400">{total - score}</p>
            <p className="text-xs text-muted-foreground mt-1">Missed</p>
          </div>
        </div>
        <Button onClick={handleRestart} className="bg-indigo-600 hover:bg-indigo-500">
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Score strip */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <Trophy className="h-4 w-4 text-amber-400" />
            <span className="text-muted-foreground font-medium">{score}/{total}</span>
          </div>
          {streak >= 2 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs text-amber-400"
            >
              <Zap className="h-3 w-3" />
              {streak}x streak!
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-indigo-400" />
          <span className="text-sm text-indigo-400 font-medium">+{xpEarned} XP</span>
          <span className="text-xs text-muted-foreground ml-2">
            {currentQ + 1} / {quizPool.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-indigo-500 rounded-full"
          animate={{ width: `${((currentQ) / quizPool.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="p-6 bg-card/80 border-border">
            <p className="text-sm text-muted-foreground mb-4">What chart pattern is shown below?</p>

            {/* Chart illustration */}
            <div className="flex justify-center py-4 border border-border rounded-md bg-background/50 mb-6">
              <svg viewBox="0 0 200 90" width="300" height="135" className="overflow-visible">
                {[20, 40, 60, 80].map((y) => (
                  <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#ffffff08" strokeWidth="0.5" />
                ))}
                <polyline
                  points={question.svgPoints
                    .split(" ")
                    .map((pt) => {
                      const [x, y] = pt.split(",").map(Number);
                      return `${(x / 120) * 190 + 5},${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((opt, idx) => {
                const isCorrect = idx === question.correctIndex;
                const isSelected = idx === selected;
                let cls = "p-3 rounded-lg border text-sm font-medium cursor-pointer transition-all text-left";
                if (selected === null) {
                  cls += " border-border bg-muted/50 text-muted-foreground hover:border-indigo-500 hover:bg-indigo-950/30";
                } else if (isCorrect) {
                  cls += " border-emerald-500 bg-emerald-950/40 text-emerald-300";
                } else if (isSelected) {
                  cls += " border-red-500 bg-red-950/40 text-red-300";
                } else {
                  cls += " border-border bg-card/30 text-muted-foreground cursor-default";
                }
                return (
                  <button key={idx} className={cls} onClick={() => handleAnswer(idx)}>
                    <div className="flex items-center gap-2">
                      {selected !== null && isCorrect && <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />}
                      {selected !== null && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                      <span>{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {selected !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <p className="text-xs text-muted-foreground leading-relaxed">{question.explanation}</p>
                  <Button
                    size="sm"
                    className="mt-3 bg-indigo-600 hover:bg-indigo-500"
                    onClick={handleNext}
                  >
                    {currentQ >= quizPool.length - 1 ? "See Results" : "Next Question"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Scan data generator ───────────────────────────────────────────────────────

const SCAN_TICKERS = [
  { ticker: "AAPL", company: "Apple Inc." },
  { ticker: "TSLA", company: "Tesla Inc." },
  { ticker: "NVDA", company: "NVIDIA Corp." },
  { ticker: "MSFT", company: "Microsoft Corp." },
  { ticker: "AMZN", company: "Amazon.com" },
  { ticker: "GOOGL", company: "Alphabet Inc." },
  { ticker: "META", company: "Meta Platforms" },
  { ticker: "AMD", company: "Advanced Micro Devices" },
  { ticker: "NFLX", company: "Netflix Inc." },
  { ticker: "CRM", company: "Salesforce Inc." },
  { ticker: "PLTR", company: "Palantir Technologies" },
  { ticker: "SQ", company: "Block Inc." },
];

function generateScanResults(rng: () => number): ScanResult[] {
  const picks = [...SCAN_TICKERS].sort(() => rng() - 0.5).slice(0, 8);
  return picks.map((stock) => {
    const patternIdx = Math.floor(rng() * PATTERNS.length);
    const pattern = PATTERNS[patternIdx];
    const confidence = Math.round(55 + rng() * 40);
    const stage: "forming" | "confirmed" = rng() > 0.4 ? "confirmed" : "forming";
    const volumeConfirm = rng() > 0.35;

    // Generate a simple mini price line
    const pts: string[] = [];
    let y = 35 + rng() * 20;
    for (let i = 0; i < 20; i++) {
      y = Math.max(10, Math.min(65, y + (rng() - 0.48) * 8));
      pts.push(`${i * 5 + 5},${y}`);
    }

    return {
      ticker: stock.ticker,
      company: stock.company,
      pattern: pattern.name,
      confidence,
      stage,
      volumeConfirm,
      category: pattern.category,
      reliability: pattern.reliability,
      svgPoints: pts.join(" "),
    };
  });
}

// ── TAB 3: Scan Simulator ─────────────────────────────────────────────────────

function ScanSimulatorTab() {
  const [rng] = useState(() => mulberry32(0xcafebabe));
  const [scanResults, setScanResults] = useState<ScanResult[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [filterCat, setFilterCat] = useState<PatternCategory | "All">("All");
  const [filterConfirmed, setFilterConfirmed] = useState(false);
  const [minReliability, setMinReliability] = useState(0);

  const handleScan = useCallback(() => {
    setScanning(true);
    setTimeout(() => {
      setScanResults(generateScanResults(rng));
      setScanning(false);
    }, 1200);
  }, [rng]);

  const filtered = useMemo(() => {
    if (!scanResults) return [];
    return scanResults.filter((r) => {
      if (filterCat !== "All" && r.category !== filterCat) return false;
      if (filterConfirmed && r.stage !== "confirmed") return false;
      if (r.reliability < minReliability) return false;
      return true;
    });
  }, [scanResults, filterCat, filterConfirmed, minReliability]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="p-4 bg-card/60 border-border">
        <div className="flex flex-wrap gap-3 items-center">
          <Button
            onClick={handleScan}
            disabled={scanning}
            className="bg-indigo-600 hover:bg-indigo-500"
          >
            {scanning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Scanning…
              </>
            ) : (
              <>
                <ScanLine className="h-4 w-4 mr-2" />
                Scan Market
              </>
            )}
          </Button>

          <div className="flex items-center gap-1.5 ml-auto flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {(["All", "Reversal", "Continuation", "Bilateral"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={cn(
                  "px-2.5 py-1 rounded text-xs border transition-colors",
                  filterCat === cat
                    ? "bg-indigo-600 border-indigo-500 text-foreground"
                    : "bg-muted border-border text-muted-foreground hover:border-muted-foreground"
                )}
              >
                {cat}
              </button>
            ))}
            <button
              onClick={() => setFilterConfirmed((v) => !v)}
              className={cn(
                "px-2.5 py-1 rounded text-xs border transition-colors",
                filterConfirmed
                  ? "bg-emerald-700 border-emerald-600 text-foreground"
                  : "bg-muted border-border text-muted-foreground hover:border-muted-foreground"
              )}
            >
              Confirmed Only
            </button>
            <select
              value={minReliability}
              onChange={(e) => setMinReliability(Number(e.target.value))}
              className="px-2 py-1 rounded text-xs bg-muted border border-border text-muted-foreground focus:outline-none"
            >
              <option value={0}>Any Reliability</option>
              <option value={65}>≥65%</option>
              <option value={70}>≥70%</option>
              <option value={75}>≥75%</option>
              <option value={80}>≥80%</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results */}
      {!scanResults && !scanning && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ScanLine className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-sm">Click "Scan Market" to detect patterns across 500+ stocks</p>
        </div>
      )}

      {scanning && (
        <div className="flex flex-col items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <ScanLine className="h-10 w-10 text-indigo-400" />
          </motion.div>
          <p className="text-sm text-muted-foreground mt-3">Scanning 500+ stocks for patterns…</p>
        </div>
      )}

      {!scanning && scanResults && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{filtered.length} patterns detected</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((result, i) => (
              <motion.div
                key={`${result.ticker}-${i}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="p-4 bg-card/60 border-border hover:border-border transition-colors">
                  <div className="flex gap-4">
                    {/* Mini chart */}
                    <div className="shrink-0 border border-border rounded-lg bg-background/50 p-1">
                      <svg viewBox="0 0 105 75" width="90" height="64">
                        {[20, 40, 60].map((y) => (
                          <line key={y} x1="0" y1={y} x2="105" y2={y} stroke="#ffffff08" strokeWidth="0.5" />
                        ))}
                        <polyline
                          points={result.svgPoints}
                          fill="none"
                          stroke={
                            result.category === "Reversal"
                              ? "#f87171"
                              : result.category === "Continuation"
                              ? "#34d399"
                              : "#818cf8"
                          }
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground text-sm">{result.ticker}</span>
                            <span
                              className={cn(
                                "text-xs px-1.5 py-0.5 rounded border",
                                result.stage === "confirmed"
                                  ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                                  : "text-amber-400 bg-amber-400/10 border-amber-400/20"
                              )}
                            >
                              {result.stage === "confirmed" ? "Confirmed" : "Forming"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{result.company}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-indigo-400">{result.confidence}%</p>
                          <p className="text-xs text-muted-foreground">confidence</p>
                        </div>
                      </div>

                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">{result.pattern}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className={cn(categoryColor(result.category), "px-1.5 py-0.5 rounded border")}>
                            {result.category}
                          </span>
                          <span>Reliability: {result.reliability}%</span>
                          {result.volumeConfirm && (
                            <span className="text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle className="h-3 w-3" /> Vol
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 h-7 text-xs border-border hover:border-indigo-500 hover:bg-indigo-950/30"
                        onClick={() =>
                          toast.success(`${result.ticker} added to watchlist`, {
                            description: `Monitoring ${result.pattern} pattern`,
                          })
                        }
                      >
                        <PlusCircle className="h-3 w-3 mr-1" />
                        Add to Watchlist
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stats data ────────────────────────────────────────────────────────────────

function buildStatsData(condition: MarketCondition) {
  return PATTERNS.map((p) => ({
    name: p.name,
    category: p.category,
    winRate:
      condition === "Bull Market"
        ? p.winRateBull
        : condition === "Bear Market"
        ? p.winRateBear
        : p.winRateSide,
    avgMove: p.avgMove,
    timeframe: p.timeframe,
    breakoutDir: p.breakoutDir,
  }));
}

// ── TAB 4: Pattern Statistics ─────────────────────────────────────────────────

function PatternStatsTab() {
  const [condition, setCondition] = useState<MarketCondition>("Bull Market");
  const data = useMemo(() => buildStatsData(condition), [condition]);

  const chartMaxRate = 85;
  const chartH = 140;
  const chartW = 600;
  const barWidth = chartW / data.length - 4;

  const sorted = useMemo(
    () => [...data].sort((a, b) => b.winRate - a.winRate),
    [data]
  );

  const recommendations = useMemo(
    () => sorted.slice(0, 3),
    [sorted]
  );

  return (
    <div className="space-y-6">
      {/* Market condition toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Market Condition:</span>
        {(["Bull Market", "Bear Market", "Sideways"] as MarketCondition[]).map((cond) => (
          <button
            key={cond}
            onClick={() => setCondition(cond)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
              condition === cond
                ? cond === "Bull Market"
                  ? "bg-emerald-700 border-emerald-600 text-foreground"
                  : cond === "Bear Market"
                  ? "bg-red-700 border-red-600 text-foreground"
                  : "bg-muted border-muted-foreground text-foreground"
                : "bg-card border-border text-muted-foreground hover:border-border"
            )}
          >
            {cond === "Bull Market" ? (
              <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{cond}</span>
            ) : cond === "Bear Market" ? (
              <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3" />{cond}</span>
            ) : (
              <span className="flex items-center gap-1"><Minus className="h-3 w-3" />{cond}</span>
            )}
          </button>
        ))}
      </div>

      {/* Bar chart */}
      <Card className="p-5 bg-card/60 border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">Win Rate by Pattern — {condition}</h3>
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartW + 20} ${chartH + 50}`}
            className="min-w-[600px] w-full"
            style={{ maxHeight: 220 }}
          >
            {/* Y-axis gridlines */}
            {[0, 25, 50, 75, 100].map((pct) => {
              const y = chartH - (pct / chartMaxRate) * chartH;
              if (y < 0) return null;
              return (
                <g key={pct}>
                  <line x1="0" y1={y} x2={chartW + 20} y2={y} stroke="#ffffff0a" strokeWidth="0.8" />
                  <text x="0" y={y - 2} fontSize="8" fill="#52525b">{pct}%</text>
                </g>
              );
            })}

            {/* Bars */}
            {data.map((d, i) => {
              const x = i * (chartW / data.length) + 2;
              const barH = Math.min(chartH, (d.winRate / chartMaxRate) * chartH);
              const y = chartH - barH;
              const color =
                d.category === "Reversal"
                  ? "#f87171"
                  : d.category === "Continuation"
                  ? "#34d399"
                  : "#818cf8";
              return (
                <g key={d.name}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barH}
                    rx="3"
                    fill={color}
                    opacity="0.75"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 3}
                    fontSize="7.5"
                    fill="#a1a1aa"
                    textAnchor="middle"
                  >
                    {d.winRate}%
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y={chartH + 12}
                    fontSize="6.5"
                    fill="#71717a"
                    textAnchor="middle"
                    transform={`rotate(-45, ${x + barWidth / 2}, ${chartH + 12})`}
                  >
                    {d.name.length > 12 ? d.name.slice(0, 11) + "…" : d.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" />Reversal</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />Continuation</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-400 inline-block" />Bilateral</span>
        </div>
      </Card>

      {/* Best patterns recommendation */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-medium text-foreground">Best Patterns for {condition}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recommendations.map((rec, rank) => (
            <div key={rec.name} className="p-3 rounded-lg bg-card/60 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-medium text-muted-foreground">#{rank + 1}</span>
                <span className="text-sm font-medium text-foreground">{rec.name}</span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Win Rate</span>
                  <span className="text-emerald-400 font-medium">{rec.winRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Move</span>
                  <span className="text-muted-foreground">~{rec.avgMove}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Timeframe</span>
                  <span className="text-muted-foreground">{rec.timeframe.split(" / ")[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Full table */}
      <Card className="p-5 bg-card/60 border-border">
        <h3 className="text-sm font-medium text-foreground mb-4">Historical Win Rate Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-2 text-muted-foreground font-medium pr-4">Pattern</th>
                <th className="text-left pb-2 text-muted-foreground font-medium pr-4">Category</th>
                <th className="text-right pb-2 text-muted-foreground font-medium pr-4">Win Rate</th>
                <th className="text-right pb-2 text-muted-foreground font-medium pr-4">Avg Move</th>
                <th className="text-left pb-2 text-muted-foreground font-medium pr-4">Timeframe</th>
                <th className="text-left pb-2 text-muted-foreground font-medium">Direction</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <tr
                  key={row.name}
                  className={cn("border-b border-border/50", i % 2 === 0 ? "bg-card/20" : "")}
                >
                  <td className="py-2 pr-4 text-foreground font-medium">{row.name}</td>
                  <td className="py-2 pr-4">
                    <span className={cn("px-1.5 py-0.5 rounded border", categoryColor(row.category))}>
                      {row.category}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-right">
                    <span
                      className={cn(
                        "font-medium",
                        row.winRate >= 75
                          ? "text-emerald-400"
                          : row.winRate >= 65
                          ? "text-amber-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {row.winRate}%
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-right text-muted-foreground">~{row.avgMove}%</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.timeframe}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-1">
                      {dirIcon(row.breakoutDir)}
                      <span className="text-muted-foreground">{row.breakoutDir}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PatternsPage() {
  return (
    <div className="p-6 space-y-6 min-h-full bg-background">
      {/* Header */}
      <div className="flex items-start justify-between border-l-4 border-l-primary rounded-lg bg-card p-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="h-5 w-5 text-indigo-400" />
            <h1 className="text-xl font-medium text-foreground">Chart Pattern Recognition</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Master 20 classic patterns — library, interactive quiz, live scan, and statistics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-indigo-500/15 text-indigo-300 border-indigo-500/30 text-xs">
            20 Patterns
          </Badge>
          <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-xs">
            <Target className="h-3 w-3 mr-1" />
            Pro
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="library" className="mt-8">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="library" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground text-muted-foreground text-sm">
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            Pattern Library
          </TabsTrigger>
          <TabsTrigger value="quiz" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground text-muted-foreground text-sm">
            <Trophy className="h-3.5 w-3.5 mr-1.5" />
            Pattern Quiz
          </TabsTrigger>
          <TabsTrigger value="scan" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground text-muted-foreground text-sm">
            <ScanLine className="h-3.5 w-3.5 mr-1.5" />
            Scan Simulator
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground text-muted-foreground text-sm">
            <BarChart2 className="h-3.5 w-3.5 mr-1.5" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="mt-6 data-[state=inactive]:hidden">
          <PatternLibraryTab />
        </TabsContent>

        <TabsContent value="quiz" className="mt-6 data-[state=inactive]:hidden">
          <PatternQuizTab />
        </TabsContent>

        <TabsContent value="scan" className="mt-6 data-[state=inactive]:hidden">
          <ScanSimulatorTab />
        </TabsContent>

        <TabsContent value="stats" className="mt-6 data-[state=inactive]:hidden">
          <PatternStatsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
