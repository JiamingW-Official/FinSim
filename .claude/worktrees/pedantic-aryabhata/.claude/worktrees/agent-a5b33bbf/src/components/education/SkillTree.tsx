"use client";

import { useState } from "react";
import { Lock, CheckCircle2, PlayCircle, X } from "lucide-react";
import { useLearnStore } from "@/stores/learn-store";

// ─── Data ──────────────────────────────────────────────────────────────────────

type SkillStatus = "completed" | "available" | "locked";

interface Skill {
  id: string;
  label: string;
  description: string;
  column: number; // 0-based
  row: number;    // 0-based within column
  prerequisites: string[];
}

const COLUMNS = [
  "Basics",
  "Technical Analysis",
  "Options",
  "Risk Management",
  "Advanced",
];

const SKILLS: Skill[] = [
  // Column 0 — Basics
  {
    id: "reading-candles",
    label: "Reading Candles",
    description: "Understand how candlestick charts encode open, high, low, and close prices in a single bar.",
    column: 0, row: 0, prerequisites: [],
  },
  {
    id: "market-orders",
    label: "Order Types",
    description: "Learn the difference between market, limit, stop-loss, and stop-limit orders.",
    column: 0, row: 1, prerequisites: [],
  },
  {
    id: "bid-ask-spread",
    label: "Bid-Ask Spread",
    description: "Understand how market makers profit from the spread and how it affects your fills.",
    column: 0, row: 2, prerequisites: ["reading-candles"],
  },
  {
    id: "portfolio-basics",
    label: "Portfolio Basics",
    description: "What a portfolio is, how to track P&L, and the difference between realized and unrealized gains.",
    column: 0, row: 3, prerequisites: ["market-orders"],
  },

  // Column 1 — Technical Analysis
  {
    id: "moving-averages",
    label: "Moving Averages",
    description: "SMA vs EMA — how they smooth price data and generate crossover signals.",
    column: 1, row: 0, prerequisites: ["reading-candles"],
  },
  {
    id: "rsi",
    label: "RSI",
    description: "Relative Strength Index: momentum oscillator measuring overbought (>70) and oversold (<30) conditions.",
    column: 1, row: 1, prerequisites: ["reading-candles"],
  },
  {
    id: "macd",
    label: "MACD",
    description: "Moving Average Convergence Divergence: trend-following momentum indicator using two EMAs and a signal line.",
    column: 1, row: 2, prerequisites: ["moving-averages"],
  },
  {
    id: "support-resistance",
    label: "Support & Resistance",
    description: "Identifying key price levels where buyers and sellers historically engage.",
    column: 1, row: 3, prerequisites: ["reading-candles"],
  },

  // Column 2 — Options
  {
    id: "calls-puts",
    label: "Calls & Puts",
    description: "The two building blocks of options: the right to buy (call) or sell (put) at a strike price.",
    column: 2, row: 0, prerequisites: ["market-orders"],
  },
  {
    id: "intrinsic-value",
    label: "Intrinsic Value",
    description: "How to calculate intrinsic value for ITM, ATM, and OTM options.",
    column: 2, row: 1, prerequisites: ["calls-puts"],
  },
  {
    id: "greeks",
    label: "The Greeks",
    description: "Delta, Gamma, Theta, Vega, and Rho — how each measures sensitivity to different risk factors.",
    column: 2, row: 2, prerequisites: ["intrinsic-value"],
  },
  {
    id: "spreads",
    label: "Spreads",
    description: "Vertical spreads, iron condors, and straddles — defined-risk multi-leg strategies.",
    column: 2, row: 3, prerequisites: ["greeks"],
  },

  // Column 3 — Risk Management
  {
    id: "position-sizing",
    label: "Position Sizing",
    description: "The 1-2% rule: never risk more than a fixed percentage of your account on a single trade.",
    column: 3, row: 0, prerequisites: ["portfolio-basics"],
  },
  {
    id: "stop-loss",
    label: "Stop-Loss Strategy",
    description: "Trailing stops, ATR-based stops, and how to prevent a bad trade from becoming a disaster.",
    column: 3, row: 1, prerequisites: ["position-sizing"],
  },
  {
    id: "diversification",
    label: "Diversification",
    description: "Correlation, sector exposure, and why spreading capital reduces idiosyncratic risk.",
    column: 3, row: 2, prerequisites: ["portfolio-basics"],
  },
  {
    id: "drawdown",
    label: "Drawdown Analysis",
    description: "Max drawdown, recovery time, and how to set account-level circuit breakers.",
    column: 3, row: 3, prerequisites: ["stop-loss", "diversification"],
  },

  // Column 4 — Advanced
  {
    id: "volatility",
    label: "Volatility",
    description: "Historical vs implied volatility, IV rank, and how to trade volatility as an asset class.",
    column: 4, row: 0, prerequisites: ["greeks"],
  },
  {
    id: "market-regime",
    label: "Market Regimes",
    description: "Trending, ranging, and volatile regimes — how to adapt your strategy to current conditions.",
    column: 4, row: 1, prerequisites: ["macd", "support-resistance"],
  },
  {
    id: "backtesting",
    label: "Backtesting",
    description: "How to validate a strategy on historical data without overfitting or look-ahead bias.",
    column: 4, row: 2, prerequisites: ["market-regime", "drawdown"],
  },
  {
    id: "portfolio-theory",
    label: "Portfolio Theory",
    description: "Efficient frontier, Sharpe ratio, and Modern Portfolio Theory principles.",
    column: 4, row: 3, prerequisites: ["diversification", "volatility"],
  },
];

// Map skill id → lesson ids that count as completion evidence
// (If any of these lesson ids are in completedLessons, skill counts as complete)
const SKILL_LESSON_MAP: Record<string, string[]> = {
  "reading-candles": ["basics-candlesticks", "basics-intro"],
  "market-orders": ["orders-market", "orders-intro"],
  "bid-ask-spread": ["basics-bid-ask"],
  "portfolio-basics": ["basics-portfolio"],
  "moving-averages": ["indicators-ma"],
  "rsi": ["indicators-rsi"],
  "macd": ["indicators-macd"],
  "support-resistance": ["indicators-sr"],
  "calls-puts": ["options-intro"],
  "intrinsic-value": ["options-pricing"],
  "greeks": ["options-greeks"],
  "spreads": ["options-spreads"],
  "position-sizing": ["risk-sizing"],
  "stop-loss": ["risk-stop-loss"],
  "diversification": ["risk-diversification"],
  "drawdown": ["risk-drawdown"],
  "volatility": ["options-volatility"],
  "market-regime": ["indicators-trend"],
  "backtesting": ["indicators-advanced"],
  "portfolio-theory": ["risk-portfolio"],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSkillStatus(
  skill: Skill,
  completedLessons: string[],
  statusCache: Map<string, SkillStatus>,
): SkillStatus {
  if (statusCache.has(skill.id)) return statusCache.get(skill.id)!;

  const lessonIds = SKILL_LESSON_MAP[skill.id] ?? [];
  const isCompleted = lessonIds.some((id) => completedLessons.includes(id));
  if (isCompleted) {
    statusCache.set(skill.id, "completed");
    return "completed";
  }

  const prereqsMet = skill.prerequisites.every((prereqId) => {
    const prereq = SKILLS.find((s) => s.id === prereqId);
    if (!prereq) return true;
    return getSkillStatus(prereq, completedLessons, statusCache) === "completed";
  });

  const status = prereqsMet ? "available" : "locked";
  statusCache.set(skill.id, status);
  return status;
}

// ─── Skill Node ───────────────────────────────────────────────────────────────

interface SkillNodeProps {
  skill: Skill;
  status: SkillStatus;
  selected: boolean;
  onClick: () => void;
}

const STATUS_BG: Record<SkillStatus, string> = {
  completed: "bg-green-500/10 border-green-500/40 text-green-400",
  available: "bg-primary/10 border-primary/40 text-primary hover:bg-primary/15",
  locked: "bg-muted/30 border-border/30 text-muted-foreground/40",
};

const STATUS_SELECTED: Record<SkillStatus, string> = {
  completed: "ring-2 ring-green-500/50",
  available: "ring-2 ring-primary/50",
  locked: "",
};

function SkillNode({ skill, status, selected, onClick }: SkillNodeProps) {
  const isLocked = status === "locked";

  return (
    <button
      type="button"
      disabled={isLocked}
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left transition-colors",
        "w-[110px] min-h-[44px]",
        STATUS_BG[status],
        selected ? STATUS_SELECTED[status] : "",
        isLocked ? "cursor-default" : "cursor-pointer",
      ].join(" ")}
      aria-label={skill.label}
    >
      <span className="flex-shrink-0">
        {status === "completed" ? (
          <CheckCircle2 className="h-3 w-3" />
        ) : status === "locked" ? (
          <Lock className="h-3 w-3" />
        ) : (
          <PlayCircle className="h-3 w-3" />
        )}
      </span>
      <span className="text-[10px] font-medium leading-tight">{skill.label}</span>
    </button>
  );
}

// ─── SVG Connector Lines ──────────────────────────────────────────────────────

const NODE_W = 110;
const NODE_H = 44;
const COL_GAP = 28;
const ROW_GAP = 12;
const ROWS = 4;

// Position: top-left corner of each node
function nodePos(col: number, row: number) {
  const x = col * (NODE_W + COL_GAP);
  const y = row * (NODE_H + ROW_GAP);
  return { x, y };
}

function centerOf(col: number, row: number) {
  const { x, y } = nodePos(col, row);
  return { cx: x + NODE_W / 2, cy: y + NODE_H / 2 };
}

interface ConnectorProps {
  from: { col: number; row: number };
  to: { col: number; row: number };
  fromStatus: SkillStatus;
}

function Connector({ from, to, fromStatus }: ConnectorProps) {
  const start = centerOf(from.col, from.row);
  const end = centerOf(to.col, to.row);

  // Cubic bezier handle offset
  const dx = end.cx - start.cx;
  const c1x = start.cx + dx * 0.5;
  const c2x = end.cx - dx * 0.5;

  const color =
    fromStatus === "completed" ? "#22c55e" : fromStatus === "available" ? "#6366f1" : "#374151";

  const opacity = fromStatus === "locked" ? 0.25 : 0.5;

  return (
    <path
      d={`M ${start.cx} ${start.cy} C ${c1x} ${start.cy}, ${c2x} ${end.cy}, ${end.cx} ${end.cy}`}
      stroke={color}
      strokeWidth={1.5}
      strokeOpacity={opacity}
      fill="none"
      strokeLinecap="round"
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SkillTree() {
  const completedLessons = useLearnStore((s) => s.completedLessons);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const statusCache = new Map<string, SkillStatus>();
  const skillStatuses = new Map<string, SkillStatus>();
  for (const skill of SKILLS) {
    skillStatuses.set(skill.id, getSkillStatus(skill, completedLessons, statusCache));
  }

  const selectedSkill = selectedId ? SKILLS.find((s) => s.id === selectedId) : null;
  const selectedStatus = selectedId ? skillStatuses.get(selectedId) : null;

  const COLS = COLUMNS.length;
  const svgW = COLS * NODE_W + (COLS - 1) * COL_GAP;
  const svgH = ROWS * NODE_H + (ROWS - 1) * ROW_GAP;

  // Build connector list
  const connectors: Array<{ from: Skill; to: Skill }> = [];
  for (const skill of SKILLS) {
    for (const prereqId of skill.prerequisites) {
      const prereq = SKILLS.find((s) => s.id === prereqId);
      if (prereq) connectors.push({ from: prereq, to: skill });
    }
  }

  const completedCount = [...skillStatuses.values()].filter((s) => s === "completed").length;
  const availableCount = [...skillStatuses.values()].filter((s) => s === "available").length;

  return (
    <div className="rounded-lg border border-border/50 bg-card p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-tight">Skill Tree</h3>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span>
            <span className="font-mono font-bold text-green-500">{completedCount}</span> completed
          </span>
          <span>
            <span className="font-mono font-bold text-primary">{availableCount}</span> available
          </span>
          <span>
            <span className="font-mono font-bold text-foreground">{SKILLS.length}</span> total
          </span>
        </div>
      </div>

      {/* Scroll container */}
      <div className="overflow-x-auto pb-2">
        <div style={{ width: svgW }} className="relative">
          {/* Column headers */}
          <div
            className="mb-2 grid text-[9px] font-medium uppercase tracking-wider text-muted-foreground"
            style={{
              gridTemplateColumns: `repeat(${COLS}, ${NODE_W}px)`,
              gap: `${COL_GAP}px`,
            }}
          >
            {COLUMNS.map((col) => (
              <div key={col} className="text-center">{col}</div>
            ))}
          </div>

          {/* SVG connector lines */}
          <svg
            width={svgW}
            height={svgH}
            className="pointer-events-none absolute left-0"
            style={{ top: 0 }}
            aria-hidden="true"
          >
            {connectors.map(({ from, to }, i) => (
              <Connector
                key={i}
                from={{ col: from.column, row: from.row }}
                to={{ col: to.column, row: to.row }}
                fromStatus={skillStatuses.get(from.id) ?? "locked"}
              />
            ))}
          </svg>

          {/* Skill nodes — positioned absolutely over SVG */}
          <div className="relative" style={{ height: svgH }}>
            {SKILLS.map((skill) => {
              const { x, y } = nodePos(skill.column, skill.row);
              const status = skillStatuses.get(skill.id) ?? "locked";
              return (
                <div
                  key={skill.id}
                  className="absolute"
                  style={{ left: x, top: y, width: NODE_W, height: NODE_H }}
                >
                  <SkillNode
                    skill={skill}
                    status={status}
                    selected={selectedId === skill.id}
                    onClick={() =>
                      setSelectedId((prev) => (prev === skill.id ? null : skill.id))
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selectedSkill && selectedStatus && (
        <div className="mt-3 rounded-lg border border-border/50 bg-muted/20 p-3">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {selectedStatus === "completed" ? (
                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
              ) : selectedStatus === "locked" ? (
                <Lock className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/40" />
              ) : (
                <PlayCircle className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
              )}
              <span className="text-xs font-semibold">{selectedSkill.label}</span>
              <span
                className={[
                  "rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider",
                  selectedStatus === "completed"
                    ? "bg-green-500/10 text-green-500"
                    : selectedStatus === "available"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground/50",
                ].join(" ")}
              >
                {selectedStatus}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="text-muted-foreground/50 hover:text-muted-foreground"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="mb-2 text-[11px] leading-relaxed text-muted-foreground">
            {selectedSkill.description}
          </p>

          {selectedSkill.prerequisites.length > 0 && selectedStatus === "locked" && (
            <p className="mb-2 text-[10px] text-muted-foreground">
              Requires:{" "}
              {selectedSkill.prerequisites
                .map((pid) => SKILLS.find((s) => s.id === pid)?.label ?? pid)
                .join(", ")}
            </p>
          )}

          {selectedStatus === "available" && (
            <div className="mt-2 inline-block rounded-md bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
              Go to Learn tab to start this topic
            </div>
          )}

          {selectedStatus === "completed" && (
            <div className="mt-2 inline-block rounded-md bg-green-500/10 px-2.5 py-1 text-[10px] font-medium text-green-500">
              Skill mastered
            </div>
          )}
        </div>
      )}
    </div>
  );
}
