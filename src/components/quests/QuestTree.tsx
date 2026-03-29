"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Star,
  Shield,
  TrendingUp,
  BookOpen,
  Trophy,
  Zap,
  Target,
  BarChart2,
  Clock,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/stores/game-store";
import { useQuestStore } from "@/stores/quest-store";

// ── Mulberry32 seeded PRNG (seed=2024) ─────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(2024);
function synthFloat(lo: number, hi: number) {
  return lo + rng() * (hi - lo);
}
function synthInt(lo: number, hi: number) {
  return Math.floor(synthFloat(lo, hi + 1));
}

// ── TypeScript interfaces ─────────────────────────────────────

export type QuestStatus = "locked" | "available" | "in_progress" | "complete";

export interface QuestObjective {
  id: string;
  label: string;
  current: number;
  target: number;
  unit?: string;
}

export interface QuestNode {
  id: string;
  branchId: string;
  label: string;
  description: string;
  icon: string;
  xpReward: number;
  badgeReward?: string;
  objectives: QuestObjective[];
  prerequisiteIds: string[];
  status: QuestStatus;
  /** grid position (col 0-based, row 0-based inside branch) */
  col: number;
  row: number;
}

export interface QuestBranch {
  id: string;
  name: string;
  color: string;          // tailwind text color
  strokeColor: string;    // SVG stroke hex
  fillColor: string;      // SVG fill hex for complete
  nodes: QuestNode[];
}

// ── Seasonal challenge ─────────────────────────────────────────

interface SeasonalChallenge {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  endsInDays: number;
  color: string;
  icon: string;
}

// ── Achievement rarity ─────────────────────────────────────────

type Rarity = "Common" | "Rare" | "Epic" | "Legendary";

function rarityForAchievement(id: string): Rarity {
  if (
    id === "options_millionaire" ||
    id === "s_rank_backtest" ||
    id === "prediction_streak_10"
  )
    return "Legendary";
  if (
    id === "condor_master" ||
    id === "risk_master" ||
    id === "portfolio_10k" ||
    id === "big_win"
  )
    return "Epic";
  if (
    id === "options_spread" ||
    id === "fifty_trades" ||
    id === "lesson_complete_20" ||
    id === "dedicated"
  )
    return "Rare";
  return "Common";
}

const RARITY_COLORS: Record<Rarity, string> = {
  Common: "text-muted-foreground border-border bg-muted",
  Rare: "text-primary border-primary bg-muted/50",
  Epic: "text-primary border-primary bg-muted/50",
  Legendary: "text-amber-400 border-amber-500 bg-amber-900/30",
};

// ── SVG layout constants ───────────────────────────────────────

const SVG_W = 800;
const SVG_H = 600;
const NODE_R = 20;

// Branch column x-centers
const COL_X: Record<string, number> = {
  trading: 120,
  options: 300,
  risk: 480,
  macro: 620,
  elite: 720,
};

// Branch row spacing
const ROW_BASE: Record<string, number> = {
  trading: 60,
  options: 140,
  risk: 120,
  macro: 200,
  elite: 280,
};
const ROW_STEP = 100;

function nodePos(node: QuestNode): [number, number] {
  const x = COL_X[node.branchId] ?? 120;
  const base = ROW_BASE[node.branchId] ?? 60;
  const y = base + node.row * ROW_STEP;
  return [x, y];
}

// ── Status colors ──────────────────────────────────────────────

const STATUS_FILL: Record<QuestStatus, string> = {
  locked: "#27272a",
  available: "#18181b",
  in_progress: "#18181b",
  complete: "#16a34a",
};
const STATUS_STROKE: Record<QuestStatus, string> = {
  locked: "#52525b",
  available: "#a1a1aa",
  in_progress: "#f59e0b",
  complete: "#22c55e",
};

// ── Branch icon component (render in SVG as foreignObject is fragile; use text) ──

function iconChar(icon: string): string {
  switch (icon) {
    case "TrendingUp": return "↗";
    case "Shield": return "⊕";
    case "BarChart2": return "≡";
    case "BookOpen": return "✦";
    case "Trophy": return "★";
    case "Target": return "◎";
    case "Check": return "✓";
    case "Lock": return "⊘";
    default: return "•";
  }
}

// ── Build quest tree data ─────────────────────────────────────

function buildQuestTree(
  totalTrades: number,
  optionsTrades: number,
  lessonsCompleted: number,
  totalPnL: number,
  maxDrawdownStreak: number,
): QuestBranch[] {
  // Helper to derive status from real data
  function deriveStatus(
    prereqIds: string[],
    allNodes: QuestNode[],
    objectiveCurrent: number,
    objectiveTarget: number,
    unlock: boolean,
  ): QuestStatus {
    if (!unlock) return "locked";
    const prereqsMet = prereqIds.every((pid) => {
      const n = allNodes.find((x) => x.id === pid);
      return n?.status === "complete";
    });
    if (!prereqsMet) return "locked";
    if (objectiveCurrent >= objectiveTarget) return "complete";
    if (objectiveCurrent > 0) return "in_progress";
    return "available";
  }

  // Trading Fundamentals (5 quests, vertical)
  const trading: QuestNode[] = [
    {
      id: "t1",
      branchId: "trading",
      label: "First Steps",
      description: "Place your first trade and learn the basics of order execution.",
      icon: "TrendingUp",
      xpReward: 50,
      objectives: [
        { id: "t1o1", label: "Place a trade", current: Math.min(totalTrades, 1), target: 1 },
      ],
      prerequisiteIds: [],
      status: "available",
      col: 0,
      row: 0,
    },
    {
      id: "t2",
      branchId: "trading",
      label: "Market Reader",
      description: "Execute 10 trades across different market conditions.",
      icon: "BarChart2",
      xpReward: 100,
      objectives: [
        { id: "t2o1", label: "Total trades", current: Math.min(totalTrades, 10), target: 10 },
      ],
      prerequisiteIds: ["t1"],
      status: "available",
      col: 0,
      row: 1,
    },
    {
      id: "t3",
      branchId: "trading",
      label: "Consistent Trader",
      description: "Reach 50 total trades to demonstrate commitment.",
      icon: "Target",
      xpReward: 250,
      objectives: [
        { id: "t3o1", label: "Total trades", current: Math.min(totalTrades, 50), target: 50 },
      ],
      prerequisiteIds: ["t2"],
      status: "available",
      col: 0,
      row: 2,
    },
    {
      id: "t4",
      branchId: "trading",
      label: "Profit Machine",
      description: "Achieve $1,000+ cumulative P&L from all trades.",
      icon: "TrendingUp",
      xpReward: 300,
      objectives: [
        {
          id: "t4o1",
          label: "Cumulative P&L",
          current: Math.min(Math.max(totalPnL, 0), 1000),
          target: 1000,
          unit: "$",
        },
      ],
      prerequisiteIds: ["t3"],
      status: "available",
      col: 0,
      row: 3,
    },
    {
      id: "t5",
      branchId: "trading",
      label: "Century Club",
      description: "Complete 100 trades — a true market participant.",
      icon: "Trophy",
      xpReward: 500,
      objectives: [
        { id: "t5o1", label: "Total trades", current: Math.min(totalTrades, 100), target: 100 },
      ],
      prerequisiteIds: ["t4"],
      status: "available",
      col: 0,
      row: 4,
    },
  ];

  // Compute trading statuses first (they have no external prereqs)
  for (const node of trading) {
    node.status = deriveStatus(
      node.prerequisiteIds,
      trading,
      node.objectives[0].current,
      node.objectives[0].target,
      true,
    );
  }

  // Options Mastery (4 quests, branching from t3)
  const options: QuestNode[] = [
    {
      id: "o1",
      branchId: "options",
      label: "Options Initiate",
      description: "Place your first options trade and explore the chain.",
      icon: "TrendingUp",
      xpReward: 100,
      objectives: [
        { id: "o1o1", label: "Options trades", current: Math.min(optionsTrades, 1), target: 1 },
      ],
      prerequisiteIds: ["t3"],
      status: "locked",
      col: 1,
      row: 1,
    },
    {
      id: "o2",
      branchId: "options",
      label: "Spread Strategist",
      description: "Execute a multi-leg spread strategy to define risk.",
      icon: "BarChart2",
      xpReward: 200,
      objectives: [
        { id: "o2o1", label: "Spread trades", current: Math.min(optionsTrades, 3), target: 3 },
      ],
      prerequisiteIds: ["o1"],
      status: "locked",
      col: 1,
      row: 2,
    },
    {
      id: "o3",
      branchId: "options",
      label: "Vol Analyst",
      description: "Study implied volatility and view the analysis dashboard.",
      icon: "Target",
      xpReward: 150,
      objectives: [
        { id: "o3o1", label: "Options analysed", current: Math.min(optionsTrades, 5), target: 5 },
      ],
      prerequisiteIds: ["o2"],
      status: "locked",
      col: 1,
      row: 3,
    },
    {
      id: "o4",
      branchId: "options",
      label: "Iron Condor King",
      description: "Execute an Iron Condor strategy for premium income.",
      icon: "Trophy",
      xpReward: 400,
      objectives: [
        { id: "o4o1", label: "Iron condors", current: Math.min(optionsTrades, 10), target: 10 },
      ],
      prerequisiteIds: ["o3"],
      status: "locked",
      col: 1,
      row: 4,
    },
  ];

  const t3Done = trading[2].status === "complete";
  for (const node of options) {
    const prereqMet =
      node.prerequisiteIds.includes("t3")
        ? t3Done && node.prerequisiteIds.filter((x) => x !== "t3").every(
            (pid) => options.find((n) => n.id === pid)?.status === "complete",
          )
        : node.prerequisiteIds.every(
            (pid) => options.find((n) => n.id === pid)?.status === "complete",
          );
    if (!prereqMet) {
      node.status = "locked";
    } else {
      const obj = node.objectives[0];
      if (obj.current >= obj.target) node.status = "complete";
      else if (obj.current > 0) node.status = "in_progress";
      else node.status = "available";
    }
  }

  // Risk Management (4 quests, branching from t2)
  const risk: QuestNode[] = [
    {
      id: "r1",
      branchId: "risk",
      label: "Stop Loss Pro",
      description: "Use stop-loss orders on 5 consecutive trades.",
      icon: "Shield",
      xpReward: 100,
      objectives: [
        {
          id: "r1o1",
          label: "Low-drawdown trades",
          current: Math.min(maxDrawdownStreak, 5),
          target: 5,
        },
      ],
      prerequisiteIds: ["t2"],
      status: "locked",
      col: 2,
      row: 1,
    },
    {
      id: "r2",
      branchId: "risk",
      label: "Drawdown Master",
      description: "Keep drawdown under 5% for 20 consecutive trades.",
      icon: "Shield",
      xpReward: 300,
      objectives: [
        {
          id: "r2o1",
          label: "Consecutive safe trades",
          current: Math.min(maxDrawdownStreak, 20),
          target: 20,
        },
      ],
      prerequisiteIds: ["r1"],
      status: "locked",
      col: 2,
      row: 2,
    },
    {
      id: "r3",
      branchId: "risk",
      label: "Position Sizer",
      description: "Execute 30 trades using proper position sizing principles.",
      icon: "Target",
      xpReward: 200,
      objectives: [
        { id: "r3o1", label: "Sized trades", current: Math.min(totalTrades, 30), target: 30 },
      ],
      prerequisiteIds: ["r2"],
      status: "locked",
      col: 2,
      row: 3,
    },
    {
      id: "r4",
      branchId: "risk",
      label: "Risk Guardian",
      description: "Prove you can protect capital across 50+ trades.",
      icon: "Shield",
      xpReward: 450,
      objectives: [
        { id: "r4o1", label: "Total trades", current: Math.min(totalTrades, 50), target: 50 },
        { id: "r4o2", label: "Max drawdown streak", current: Math.min(maxDrawdownStreak, 10), target: 10 },
      ],
      prerequisiteIds: ["r3"],
      status: "locked",
      col: 2,
      row: 4,
    },
  ];

  const t2Done = trading[1].status === "complete";
  for (const node of risk) {
    const prereqMet =
      node.prerequisiteIds.includes("t2")
        ? t2Done && node.prerequisiteIds.filter((x) => x !== "t2").every(
            (pid) => risk.find((n) => n.id === pid)?.status === "complete",
          )
        : node.prerequisiteIds.every(
            (pid) => risk.find((n) => n.id === pid)?.status === "complete",
          );
    if (!prereqMet) {
      node.status = "locked";
    } else {
      const allObj = node.objectives;
      const firstDone = allObj.every((o) => o.current >= o.target);
      const anyProgress = allObj.some((o) => o.current > 0);
      if (firstDone) node.status = "complete";
      else if (anyProgress) node.status = "in_progress";
      else node.status = "available";
    }
  }

  // Macro / Fundamental (3 quests, branching from r2)
  const macro: QuestNode[] = [
    {
      id: "m1",
      branchId: "macro",
      label: "Market Student",
      description: "Complete 5 educational lessons on market fundamentals.",
      icon: "BookOpen",
      xpReward: 100,
      objectives: [
        { id: "m1o1", label: "Lessons completed", current: Math.min(lessonsCompleted, 5), target: 5 },
      ],
      prerequisiteIds: ["r2"],
      status: "locked",
      col: 3,
      row: 2,
    },
    {
      id: "m2",
      branchId: "macro",
      label: "Fundamental Analyst",
      description: "Complete 15 lessons across trading and macro topics.",
      icon: "BookOpen",
      xpReward: 250,
      objectives: [
        { id: "m2o1", label: "Lessons completed", current: Math.min(lessonsCompleted, 15), target: 15 },
      ],
      prerequisiteIds: ["m1"],
      status: "locked",
      col: 3,
      row: 3,
    },
    {
      id: "m3",
      branchId: "macro",
      label: "Market Scholar",
      description: "Complete 25 lessons and demonstrate deep market knowledge.",
      icon: "Trophy",
      xpReward: 400,
      objectives: [
        { id: "m3o1", label: "Lessons completed", current: Math.min(lessonsCompleted, 25), target: 25 },
      ],
      prerequisiteIds: ["m2"],
      status: "locked",
      col: 3,
      row: 4,
    },
  ];

  const r2Done = risk[1].status === "complete";
  for (const node of macro) {
    const prereqMet =
      node.prerequisiteIds.includes("r2")
        ? r2Done && node.prerequisiteIds.filter((x) => x !== "r2").every(
            (pid) => macro.find((n) => n.id === pid)?.status === "complete",
          )
        : node.prerequisiteIds.every(
            (pid) => macro.find((n) => n.id === pid)?.status === "complete",
          );
    if (!prereqMet) {
      node.status = "locked";
    } else {
      const obj = node.objectives[0];
      if (obj.current >= obj.target) node.status = "complete";
      else if (obj.current > 0) node.status = "in_progress";
      else node.status = "available";
    }
  }

  // Elite Trader (1 quest, requires all branches)
  const allOtherDone =
    trading[4].status === "complete" &&
    options[3].status === "complete" &&
    risk[3].status === "complete" &&
    macro[2].status === "complete";

  const eliteProgress = [
    trading[4].status === "complete" ? 1 : 0,
    options[3].status === "complete" ? 1 : 0,
    risk[3].status === "complete" ? 1 : 0,
    macro[2].status === "complete" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const elite: QuestNode[] = [
    {
      id: "e1",
      branchId: "elite",
      label: "Elite Trader",
      description:
        "Master all branches: Trading, Options, Risk, and Macro. The ultimate achievement.",
      icon: "Trophy",
      xpReward: 2000,
      badgeReward: "Elite Trader",
      objectives: [
        { id: "e1o1", label: "Branches mastered", current: eliteProgress, target: 4 },
      ],
      prerequisiteIds: ["t5", "o4", "r4", "m3"],
      status: allOtherDone ? "complete" : eliteProgress > 0 ? "in_progress" : "locked",
      col: 4,
      row: 2,
    },
  ];

  return [
    {
      id: "trading",
      name: "Trading Fundamentals",
      color: "text-emerald-400",
      strokeColor: "#22c55e",
      fillColor: "#16a34a",
      nodes: trading,
    },
    {
      id: "options",
      name: "Options Mastery",
      color: "text-primary",
      strokeColor: "#3b82f6",
      fillColor: "#1d4ed8",
      nodes: options,
    },
    {
      id: "risk",
      name: "Risk Management",
      color: "text-red-400",
      strokeColor: "#ef4444",
      fillColor: "#b91c1c",
      nodes: risk,
    },
    {
      id: "macro",
      name: "Macro / Fundamental",
      color: "text-amber-400",
      strokeColor: "#f59e0b",
      fillColor: "#b45309",
      nodes: macro,
    },
    {
      id: "elite",
      name: "Elite Trader",
      color: "text-yellow-300",
      strokeColor: "#fde047",
      fillColor: "#ca8a04",
      nodes: elite,
    },
  ];
}

// Flatten all nodes for lookup
function flatNodes(branches: QuestBranch[]): QuestNode[] {
  return branches.flatMap((b) => b.nodes);
}

// ── Seasonal challenge data (synthetic) ──────────────────────

const SEASONAL: SeasonalChallenge[] = [
  {
    id: "sc1",
    title: "Bull Run Sprint",
    description: "Generate positive P&L on at least 10 trades this season.",
    current: synthInt(2, 9),
    target: 10,
    endsInDays: 14,
    color: "text-emerald-400",
    icon: "TrendingUp",
  },
  {
    id: "sc2",
    title: "Options Blitz",
    description: "Execute 5 options strategies before the season ends.",
    current: synthInt(0, 4),
    target: 5,
    endsInDays: 14,
    color: "text-primary",
    icon: "BarChart2",
  },
  {
    id: "sc3",
    title: "Knowledge Seeker",
    description: "Complete 8 lessons this season to prove your commitment.",
    current: synthInt(1, 7),
    target: 8,
    endsInDays: 14,
    color: "text-primary",
    icon: "BookOpen",
  },
];

// ── SVG Pulse animation for in-progress nodes ─────────────────

function PulseRing({
  cx,
  cy,
  color,
}: {
  cx: number;
  cy: number;
  color: string;
}) {
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={NODE_R + 4}
      fill="none"
      stroke={color}
      strokeWidth={2}
      initial={{ opacity: 0.6, scale: 1 }}
      animate={{ opacity: 0, scale: 1.5 }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    />
  );
}

// ── Quest detail panel ────────────────────────────────────────

function QuestDetailPanel({
  node,
  branch,
  allNodes,
  onClose,
}: {
  node: QuestNode;
  branch: QuestBranch;
  allNodes: QuestNode[];
  onClose: () => void;
}) {
  const prereqNodes = node.prerequisiteIds.map((pid) =>
    allNodes.find((n) => n.id === pid),
  );

  return (
    <motion.div
      initial={{ x: 72, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 72, opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="w-[300px] shrink-0 rounded-xl border border-border bg-card flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div
        className={cn(
          "px-4 py-3 flex items-start justify-between gap-2 border-b border-border",
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "h-9 w-9 rounded-lg flex items-center justify-center text-lg font-bold",
              node.status === "complete"
                ? "bg-emerald-500/10"
                : node.status === "in_progress"
                  ? "bg-amber-500/10"
                  : node.status === "locked"
                    ? "bg-muted"
                    : "bg-muted",
            )}
          >
            {node.status === "locked" ? (
              <Lock className="h-4 w-4 text-muted-foreground/70" />
            ) : node.status === "complete" ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <span className={cn("text-sm", branch.color)}>
                {iconChar(node.icon)}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-tight">
              {node.label}
            </p>
            <p className={cn("text-xs font-semibold", branch.color)}>
              {branch.name}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors mt-0.5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {node.description}
        </p>

        {/* XP + Badge rewards */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1">
            <Zap className="h-3 w-3 text-amber-400" />
            <span className="text-[11px] font-bold text-amber-400">
              {node.xpReward} XP
            </span>
          </div>
          {node.badgeReward && (
            <div className="flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1">
              <Star className="h-3 w-3 text-yellow-400" />
              <span className="text-[11px] font-bold text-yellow-400">
                {node.badgeReward}
              </span>
            </div>
          )}
        </div>

        {/* Status badge */}
        <div>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide border",
              node.status === "complete"
                ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                : node.status === "in_progress"
                  ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                  : node.status === "locked"
                    ? "text-muted-foreground border-border bg-muted"
                    : "text-muted-foreground border-border bg-muted",
            )}
          >
            {node.status === "complete"
              ? "Complete"
              : node.status === "in_progress"
                ? "In Progress"
                : node.status === "locked"
                  ? "Locked"
                  : "Available"}
          </span>
        </div>

        {/* Objectives */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-foreground uppercase tracking-wide">
            Objectives
          </p>
          {node.objectives.map((obj) => {
            const pct = Math.min(100, (obj.current / obj.target) * 100);
            return (
              <div key={obj.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{obj.label}</span>
                  <span className="font-bold tabular-nums text-foreground">
                    {obj.unit === "$"
                      ? `$${obj.current.toLocaleString()} / $${obj.target.toLocaleString()}`
                      : `${obj.current} / ${obj.target}`}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      pct >= 100 ? "bg-emerald-500" : "bg-primary",
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Prerequisites */}
        {prereqNodes.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-foreground uppercase tracking-wide">
              Prerequisites
            </p>
            {prereqNodes.map((pn) =>
              pn ? (
                <div
                  key={pn.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2"
                >
                  {pn.status === "complete" ? (
                    <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                  ) : (
                    <Lock className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                  )}
                  <span className="text-[11px] text-muted-foreground">
                    {pn.label}
                  </span>
                </div>
              ) : null,
            )}
          </div>
        )}

        {/* CTA button */}
        <button
          type="button"
          className={cn(
            "w-full rounded-lg py-2 text-sm font-bold transition-colors",
            node.status === "complete"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
              : node.status === "locked"
                ? "bg-muted text-muted-foreground border border-border cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {node.status === "complete"
            ? "Completed"
            : node.status === "locked"
              ? "Locked"
              : node.status === "in_progress"
                ? "View Progress"
                : "Start Quest"}
        </button>
      </div>
    </motion.div>
  );
}

// ── Achievement card ──────────────────────────────────────────

function AchievementCard({ achievement }: { achievement: { id: string; name: string; description: string; icon: string; unlockedAt: number } }) {
  const rarity = rarityForAchievement(achievement.id);
  const date = new Date(achievement.unlockedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(
          `I earned "${achievement.name}" on FinSim! ${achievement.description}`,
        )
        .catch(() => {});
    }
  };

  return (
    <div
      className={cn(
        "shrink-0 w-40 rounded-xl border p-3 flex flex-col gap-2 transition-all hover:scale-[1.02]",
        RARITY_COLORS[rarity],
      )}
    >
      {/* Rarity badge */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-[11px] font-bold px-1.5 py-0.5 rounded border",
            RARITY_COLORS[rarity],
          )}
        >
          {rarity}
        </span>
        <button
          type="button"
          onClick={handleShare}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Share2 className="h-3 w-3" />
        </button>
      </div>

      {/* Icon */}
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/20 text-xl mx-auto">
        {achievement.icon === "Trophy" ? (
          <Trophy className="h-5 w-5" />
        ) : achievement.icon === "TrendingUp" ? (
          <TrendingUp className="h-5 w-5" />
        ) : achievement.icon === "Shield" ? (
          <Shield className="h-5 w-5" />
        ) : achievement.icon === "BookOpen" ? (
          <BookOpen className="h-5 w-5" />
        ) : achievement.icon === "Star" ? (
          <Star className="h-5 w-5" />
        ) : achievement.icon === "Target" ? (
          <Target className="h-5 w-5" />
        ) : achievement.icon === "Zap" ? (
          <Zap className="h-5 w-5" />
        ) : (
          <BarChart2 className="h-5 w-5" />
        )}
      </div>

      {/* Name + desc */}
      <div>
        <p className="text-[11px] font-bold leading-tight">{achievement.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
          {achievement.description}
        </p>
      </div>

      {/* Date */}
      <p className="text-[11px] text-muted-foreground/60 mt-auto">Earned {date}</p>
    </div>
  );
}

// ── Achievement progress ring (>50% close achievements) ────────

function ProgressRing({
  current,
  target,
  color,
  size = 36,
}: {
  current: number;
  target: number;
  color: string;
  size?: number;
}) {
  const pct = Math.min(current / target, 1);
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#27272a" strokeWidth={3} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeDasharray={`${circ}`}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        strokeLinecap="round"
        style={{ transformOrigin: `${size / 2}px ${size / 2}px`, transform: "rotate(-90deg)" }}
      />
    </svg>
  );
}

// ── Main QuestTree component ──────────────────────────────────

export function QuestTree() {
  const stats = useGameStore((s) => s.stats);
  const achievements = useGameStore((s) => s.achievements);
  const lessonsCompleted = useGameStore((s) => s.stats.lessonsCompleted);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [seasonExpanded, setSeasonExpanded] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Build tree
  const branches = useMemo(
    () =>
      buildQuestTree(
        stats.totalTrades,
        stats.optionsTradesCount,
        lessonsCompleted,
        stats.totalPnL,
        stats.maxDrawdownStreak,
      ),
    [
      stats.totalTrades,
      stats.optionsTradesCount,
      lessonsCompleted,
      stats.totalPnL,
      stats.maxDrawdownStreak,
    ],
  );

  const all = useMemo(() => flatNodes(branches), [branches]);

  const selectedNode = selectedNodeId
    ? all.find((n) => n.id === selectedNodeId) ?? null
    : null;
  const selectedBranch = selectedNode
    ? branches.find((b) => b.id === selectedNode.branchId) ?? null
    : null;

  // Near-completion achievements (progress > 50% but not earned yet)
  const nearAchievements = useMemo(() => {
    const earnedIds = new Set(achievements.map((a) => a.id));
    const candidates: Array<{ id: string; name: string; current: number; target: number; color: string }> = [
      {
        id: "fifty_trades",
        name: "Seasoned",
        current: stats.totalTrades,
        target: 50,
        color: "#a78bfa",
      },
      {
        id: "lesson_complete_20",
        name: "Scholar",
        current: lessonsCompleted,
        target: 20,
        color: "#60a5fa",
      },
      {
        id: "risk_master",
        name: "Risk Master",
        current: stats.maxDrawdownStreak,
        target: 20,
        color: "#f87171",
      },
    ];
    return candidates.filter(
      (c) => !earnedIds.has(c.id) && c.current / c.target > 0.5,
    );
  }, [achievements, stats, lessonsCompleted]);

  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    node: QuestNode;
    x: number;
    y: number;
  } | null>(null);

  return (
    <div className="space-y-5">
      {/* ── Main layout: SVG tree + detail panel side-by-side ── */}
      <div className="flex gap-4 items-start">
        {/* SVG Tree */}
        <div className="flex-1 min-w-0 rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 pt-3 pb-2 border-b border-border">
            <p className="text-xs font-bold text-foreground">Quest Skill Tree</p>
            <p className="text-[11px] text-muted-foreground">
              Click any node to view quest details
            </p>
          </div>

          {/* Legend */}
          <div className="px-4 py-2 flex items-center gap-4 flex-wrap border-b border-border/50">
            {[
              { label: "Locked", color: "#52525b", fill: "#27272a" },
              { label: "Available", color: "#a1a1aa", fill: "#18181b" },
              { label: "In Progress", color: "#f59e0b", fill: "#18181b" },
              { label: "Complete", color: "#22c55e", fill: "#16a34a" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <svg width={14} height={14}>
                  <circle
                    cx={7}
                    cy={7}
                    r={5}
                    fill={item.fill}
                    stroke={item.color}
                    strokeWidth={1.5}
                  />
                </svg>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Branch labels */}
          <div className="relative px-2">
            <div
              className="flex text-[11px] font-bold"
              style={{ paddingTop: 6 }}
            >
              {[
                { label: "Trading", color: "text-emerald-400", x: COL_X.trading },
                { label: "Options", color: "text-primary", x: COL_X.options },
                { label: "Risk Mgmt", color: "text-red-400", x: COL_X.risk },
                { label: "Macro", color: "text-amber-400", x: COL_X.macro },
                { label: "Elite", color: "text-yellow-300", x: COL_X.elite },
              ].map((bl) => (
                <div
                  key={bl.label}
                  className={cn("absolute text-center", bl.color)}
                  style={{
                    left: bl.x - 36,
                    width: 72,
                    top: 4,
                  }}
                >
                  {bl.label}
                </div>
              ))}
            </div>

            {/* SVG */}
            <svg
              ref={svgRef}
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="w-full"
              style={{ maxHeight: 520 }}
              onMouseLeave={() => setTooltip(null)}
            >
              {/* Connecting lines */}
              {branches.flatMap((branch) =>
                branch.nodes.flatMap((node) =>
                  node.prerequisiteIds.map((pid) => {
                    const prereq = all.find((n) => n.id === pid);
                    if (!prereq) return null;
                    const [x1, y1] = nodePos(prereq);
                    const [x2, y2] = nodePos(node);
                    const unlocked = node.status !== "locked";
                    return (
                      <line
                        key={`${pid}-${node.id}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={unlocked ? branch.strokeColor : "#3f3f46"}
                        strokeWidth={2}
                        strokeDasharray={unlocked ? "none" : "6 4"}
                        opacity={unlocked ? 0.7 : 0.4}
                      />
                    );
                  }),
                ),
              )}

              {/* Nodes */}
              {branches.flatMap((branch) =>
                branch.nodes.map((node) => {
                  const [cx, cy] = nodePos(node);
                  const isSelected = selectedNodeId === node.id;

                  return (
                    <g
                      key={node.id}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() =>
                        setTooltip({ node, x: cx, y: cy })
                      }
                      onMouseLeave={() => setTooltip(null)}
                      onClick={() =>
                        setSelectedNodeId(
                          isSelected ? null : node.id,
                        )
                      }
                    >
                      {/* Pulse ring for in-progress */}
                      {node.status === "in_progress" && (
                        <PulseRing
                          cx={cx}
                          cy={cy}
                          color={branch.strokeColor}
                        />
                      )}

                      {/* Selection ring */}
                      {isSelected && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={NODE_R + 6}
                          fill="none"
                          stroke={branch.strokeColor}
                          strokeWidth={2}
                          opacity={0.5}
                        />
                      )}

                      {/* Main circle */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={NODE_R}
                        fill={STATUS_FILL[node.status]}
                        stroke={
                          isSelected
                            ? branch.strokeColor
                            : STATUS_STROKE[node.status]
                        }
                        strokeWidth={isSelected ? 2.5 : 2}
                      />

                      {/* Icon text */}
                      <text
                        x={cx}
                        y={cy + 5}
                        textAnchor="middle"
                        fontSize={14}
                        fill={
                          node.status === "locked"
                            ? "#52525b"
                            : node.status === "complete"
                              ? "#fff"
                              : branch.strokeColor
                        }
                      >
                        {node.status === "locked"
                          ? "⊘"
                          : node.status === "complete"
                            ? "✓"
                            : iconChar(node.icon)}
                      </text>

                      {/* Node label below */}
                      <text
                        x={cx}
                        y={cy + NODE_R + 14}
                        textAnchor="middle"
                        fontSize={9}
                        fill={
                          node.status === "locked" ? "#52525b" : "#a1a1aa"
                        }
                        fontWeight="600"
                      >
                        {node.label.length > 12
                          ? node.label.slice(0, 11) + "…"
                          : node.label}
                      </text>
                    </g>
                  );
                }),
              )}

              {/* Tooltip */}
              {tooltip && (() => {
                const { node, x, y } = tooltip;
                const tw = 160;
                const th = 68;
                const tx = Math.min(x + 28, SVG_W - tw - 4);
                const ty = Math.max(y - th / 2, 4);
                const b = branches.find((br) => br.id === node.branchId);
                return (
                  <g>
                    <rect
                      x={tx}
                      y={ty}
                      width={tw}
                      height={th}
                      rx={6}
                      fill="#18181b"
                      stroke="#3f3f46"
                      strokeWidth={1}
                    />
                    <text x={tx + 8} y={ty + 16} fontSize={10} fill="#f4f4f5" fontWeight="700">
                      {node.label}
                    </text>
                    <text x={tx + 8} y={ty + 28} fontSize={8} fill="#71717a">
                      {b?.name ?? ""}
                    </text>
                    <text x={tx + 8} y={ty + 42} fontSize={8} fill="#a1a1aa" className="whitespace-pre-wrap">
                      {node.description.length > 55
                        ? node.description.slice(0, 52) + "…"
                        : node.description}
                    </text>
                    <text x={tx + 8} y={ty + 58} fontSize={8} fill="#f59e0b" fontWeight="700">
                      +{node.xpReward} XP
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedNode && selectedBranch && (
            <QuestDetailPanel
              node={selectedNode}
              branch={selectedBranch}
              allNodes={all}
              onClose={() => setSelectedNodeId(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Achievement Showcase ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 pt-3 pb-2 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-foreground">Achievement Showcase</p>
            <p className="text-[11px] text-muted-foreground">
              {achievements.length} earned · hover to inspect
            </p>
          </div>
          {nearAchievements.length > 0 && (
            <span className="text-xs font-bold text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5 bg-amber-500/10">
              {nearAchievements.length} almost done
            </span>
          )}
        </div>

        {achievements.length === 0 ? (
          <div className="px-4 py-6 text-center text-[11px] text-muted-foreground">
            No achievements yet — start trading to earn your first badge!
          </div>
        ) : (
          <div className="px-4 py-3 flex gap-3 overflow-x-auto scrollbar-hide">
            {achievements.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 20 }}
              >
                <AchievementCard achievement={a} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Near-completion rings */}
        {nearAchievements.length > 0 && (
          <div className="px-4 py-3 border-t border-border/50 flex items-center gap-4 flex-wrap">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Almost earned
            </p>
            {nearAchievements.map((nc) => (
              <div key={nc.id} className="flex items-center gap-2">
                <ProgressRing
                  current={nc.current}
                  target={nc.target}
                  color={nc.color}
                  size={36}
                />
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {nc.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground tabular-nums">
                    {nc.current}/{nc.target}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Seasonal Challenges (collapsible) ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <button
          type="button"
          onClick={() => setSeasonExpanded((v) => !v)}
          className="w-full px-4 py-3 flex items-center justify-between border-b border-border hover:bg-muted/20 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-md bg-amber-500 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-foreground">
                Seasonal Challenges
              </p>
              <p className="text-xs text-muted-foreground">
                Season ends in {SEASONAL[0].endsInDays} days
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400">
              {SEASONAL.filter((s) => s.current >= s.target).length}/{SEASONAL.length} done
            </span>
            {seasonExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {seasonExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {/* Season ends gradient banner */}
              <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/10">
                <p className="text-[11px] font-bold text-amber-400">
                  Season ends in {SEASONAL[0].endsInDays} days — complete challenges for bonus XP!
                </p>
              </div>

              <div className="p-4 space-y-4">
                {SEASONAL.map((sc, i) => {
                  const pct = Math.min(100, (sc.current / sc.target) * 100);
                  const done = sc.current >= sc.target;
                  return (
                    <motion.div
                      key={sc.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={cn(
                        "rounded-lg border p-3.5 transition-colors",
                        done
                          ? "border-emerald-500/20 bg-emerald-500/5"
                          : "border-border bg-muted/10",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className={cn(
                                "text-sm font-bold",
                                done ? "text-emerald-400" : "text-foreground",
                              )}
                            >
                              {sc.title}
                            </p>
                            {done && (
                              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {sc.description}
                          </p>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                {sc.current} / {sc.target}
                              </span>
                              <span
                                className={cn(
                                  "font-bold tabular-nums",
                                  done
                                    ? "text-emerald-400"
                                    : "text-muted-foreground",
                                )}
                              >
                                {Math.round(pct)}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <motion.div
                                className={cn(
                                  "h-full rounded-full",
                                  done ? "bg-emerald-500" : "bg-amber-500",
                                )}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{
                                  duration: 0.6,
                                  ease: "easeOut",
                                  delay: i * 0.1,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <div className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5">
                            <Clock className="h-2.5 w-2.5 text-amber-400" />
                            <span className="text-[11px] font-bold text-amber-400">
                              {sc.endsInDays}d left
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
