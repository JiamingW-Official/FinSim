"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { useTradingStore } from "@/stores/trading-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  RefreshCw,
  Lock,
  Unlock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Target,
  Calendar,
  DollarSign,
  BarChart3,
  Minus,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AssetClass = "usStocks" | "intlStocks" | "bonds" | "cash";
type TargetMode = "assetClass" | "ticker";
type StrategyPreset = "conservative" | "balanced" | "aggressive" | "allEquity";

interface AssetClassTargets {
  usStocks: number;
  intlStocks: number;
  bonds: number;
  cash: number;
}

interface TickerTarget {
  ticker: string;
  target: number;
  locked: boolean;
}

interface HoldingRow {
  ticker: string;
  currentValue: number;
  currentWeight: number;
  targetWeight: number;
  deviation: number;
  action: "buy" | "sell" | "hold";
  dollarDiff: number;
  side: "long" | "short";
  avgPrice: number;
  quantity: number;
  unrealizedPnL: number;
  openedAtTimestamp?: number;
}

interface TradeAction {
  ticker: string;
  action: "buy" | "sell";
  currentValue: number;
  targetValue: number;
  dollarAmount: number;
  estimatedShares: number;
  currentPrice: number;
  priority: number;
  isLosser: boolean;
  heldLessThanYear: boolean;
}

interface RebalancingEvent {
  id: string;
  date: string;
  numTrades: number;
  postDriftScore: number;
  estimatedCost: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COMMISSION_PER_TRADE = 0; // Free trading (modern brokers)
const DRIFT_THRESHOLD_DEFAULT = 5;

const STRATEGY_PRESETS: Record<StrategyPreset, AssetClassTargets & { label: string; description: string }> = {
  conservative: {
    label: "Conservative",
    description: "Lower risk, higher bond allocation",
    usStocks: 40,
    intlStocks: 20,
    bonds: 35,
    cash: 5,
  },
  balanced: {
    label: "Balanced",
    description: "Classic 60/20/15/5 allocation",
    usStocks: 60,
    intlStocks: 20,
    bonds: 15,
    cash: 5,
  },
  aggressive: {
    label: "Aggressive",
    description: "Higher equity, minimal bonds",
    usStocks: 80,
    intlStocks: 15,
    bonds: 5,
    cash: 0,
  },
  allEquity: {
    label: "All-Equity",
    description: "100% stocks, maximum growth",
    usStocks: 100,
    intlStocks: 0,
    bonds: 0,
    cash: 0,
  },
};

const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  usStocks: "US Stocks",
  intlStocks: "Intl Stocks",
  bonds: "Bonds",
  cash: "Cash",
};

const ASSET_CLASS_COLORS: Record<AssetClass, string> = {
  usStocks: "#3b82f6",
  intlStocks: "#10b981",
  bonds: "#f59e0b",
  cash: "#6b7280",
};

const BAR_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPct(v: number, digits = 1): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(digits)}%`;
}

function fmtAbs(v: number): string {
  return `${v.toFixed(1)}%`;
}

function getDriftColor(deviation: number): string {
  const abs = Math.abs(deviation);
  if (abs > 5) return "text-red-400";
  if (abs > 2) return "text-amber-400";
  return "text-emerald-400";
}

function getDriftBg(deviation: number): string {
  const abs = Math.abs(deviation);
  if (abs > 5) return "bg-red-500/5 text-red-400 border-red-500/20";
  if (abs > 2) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  return "bg-emerald-500/5 text-emerald-400 border-emerald-500/20";
}

function isHeldLessThanYear(openedAtTimestamp?: number): boolean {
  if (!openedAtTimestamp) return false;
  const oneYearMs = 365 * 24 * 60 * 60 * 1000;
  return Date.now() - openedAtTimestamp < oneYearMs;
}

// Generate seeded rebalancing history for demo
function generateHistory(): RebalancingEvent[] {
  const now = Date.now();
  return [
    { id: "h1", date: new Date(now - 90 * 86400000).toLocaleDateString(), numTrades: 4, postDriftScore: 1.2, estimatedCost: 0 },
    { id: "h2", date: new Date(now - 180 * 86400000).toLocaleDateString(), numTrades: 3, postDriftScore: 0.9, estimatedCost: 0 },
    { id: "h3", date: new Date(now - 270 * 86400000).toLocaleDateString(), numTrades: 6, postDriftScore: 1.4, estimatedCost: 0 },
    { id: "h4", date: new Date(now - 360 * 86400000).toLocaleDateString(), numTrades: 2, postDriftScore: 0.7, estimatedCost: 0 },
  ];
}

// ─── Drift Over Time SVG Chart ────────────────────────────────────────────────

function DriftChart({ history, currentDrift }: { history: RebalancingEvent[]; currentDrift: number }) {
  const w = 400;
  const h = 100;
  const pad = { left: 32, right: 12, top: 10, bottom: 20 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  // Simulate drift trend data between rebalancing events
  const points: { x: number; y: number; isRebalance: boolean }[] = [];
  const maxDrift = 12;

  history.forEach((event, i) => {
    const t = i / (history.length - 1);
    const x = pad.left + t * innerW;
    // drift grows to ~8% before rebalancing, drops to event.postDriftScore after
    const preY = pad.top + ((maxDrift - 7) / maxDrift) * innerH;
    const postY = pad.top + ((maxDrift - event.postDriftScore) / maxDrift) * innerH;
    if (i > 0) points.push({ x, y: preY, isRebalance: false });
    points.push({ x, y: postY, isRebalance: true });
  });

  // Current drift
  const curX = w - pad.right;
  const curY = pad.top + ((maxDrift - currentDrift) / maxDrift) * innerH;
  points.push({ x: curX, y: curY, isRebalance: false });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  const yTicks = [0, 3, 6, 9, 12];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 100 }}>
      {/* Grid */}
      {yTicks.map((tick) => {
        const y = pad.top + ((maxDrift - tick) / maxDrift) * innerH;
        return (
          <g key={tick}>
            <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="#374151" strokeWidth={0.5} />
            <text x={pad.left - 4} y={y + 3} textAnchor="end" fontSize={8} fill="#6b7280">{tick}%</text>
          </g>
        );
      })}

      {/* 5% threshold line */}
      {(() => {
        const threshY = pad.top + ((maxDrift - 5) / maxDrift) * innerH;
        return (
          <line x1={pad.left} y1={threshY} x2={w - pad.right} y2={threshY}
            stroke="#ef4444" strokeWidth={0.8} strokeDasharray="3,3" />
        );
      })()}

      {/* Line */}
      <polyline points={polyline} fill="none" stroke="#3b82f6" strokeWidth={1.5} />

      {/* Rebalance markers */}
      {points.filter((p) => p.isRebalance).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#10b981" />
      ))}

      {/* Current dot */}
      <circle cx={curX} cy={curY} r={3} fill="#3b82f6" />

      {/* Threshold label */}
      {(() => {
        const threshY = pad.top + ((maxDrift - 5) / maxDrift) * innerH;
        return <text x={w - pad.right + 2} y={threshY + 3} fontSize={7} fill="#ef4444">5%</text>;
      })()}
    </svg>
  );
}

// ─── Horizontal Grouped Bar Chart ────────────────────────────────────────────

function GroupedBarChart({ rows }: { rows: HoldingRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-[11px] text-muted-foreground">
        No positions to chart
      </div>
    );
  }

  const barH = 14;
  const gap = 4;
  const groupH = barH * 2 + gap + 10;
  const padLeft = 56;
  const padRight = 12;
  const padTop = 10;
  const svgH = rows.length * groupH + padTop + 20;
  const svgW = 400;
  const innerW = svgW - padLeft - padRight;

  const maxVal = Math.max(...rows.map((r) => Math.max(r.currentWeight, r.targetWeight)), 1);

  const xTicks = [0, 25, 50, 75, 100].filter((t) => t <= maxVal + 5);

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: svgH }}>
      {/* X-axis ticks */}
      {xTicks.map((tick) => {
        const x = padLeft + (tick / (maxVal + 5)) * innerW;
        return (
          <g key={tick}>
            <line x1={x} y1={padTop} x2={x} y2={svgH - 16} stroke="#374151" strokeWidth={0.5} />
            <text x={x} y={svgH - 4} textAnchor="middle" fontSize={8} fill="#6b7280">{tick}%</text>
          </g>
        );
      })}

      {rows.map((row, i) => {
        const y = padTop + i * groupH;
        const curW = (row.currentWeight / (maxVal + 5)) * innerW;
        const tgtW = (row.targetWeight / (maxVal + 5)) * innerW;
        const color = BAR_COLORS[i % BAR_COLORS.length];

        return (
          <g key={row.ticker}>
            <text x={padLeft - 4} y={y + barH} textAnchor="end" fontSize={9} fill="#9ca3af" fontWeight="600">
              {row.ticker}
            </text>
            {/* Current bar */}
            <rect x={padLeft} y={y} width={Math.max(curW, 1)} height={barH} fill={color} opacity={0.7} rx={1} />
            <text x={padLeft + curW + 3} y={y + barH - 2} fontSize={8} fill="#9ca3af">{row.currentWeight.toFixed(1)}%</text>

            {/* Target bar */}
            <rect x={padLeft} y={y + barH + gap} width={Math.max(tgtW, 1)} height={barH} fill={color} opacity={0.35} rx={1} />
            <text x={padLeft + tgtW + 3} y={y + barH + gap + barH - 2} fontSize={8} fill="#6b7280">{row.targetWeight.toFixed(1)}%</text>
          </g>
        );
      })}

      {/* Legend */}
      <rect x={padLeft} y={svgH - 14} width={8} height={6} fill="#3b82f6" opacity={0.7} rx={1} />
      <text x={padLeft + 10} y={svgH - 8} fontSize={8} fill="#9ca3af">Current</text>
      <rect x={padLeft + 55} y={svgH - 14} width={8} height={6} fill="#3b82f6" opacity={0.35} rx={1} />
      <text x={padLeft + 65} y={svgH - 8} fontSize={8} fill="#6b7280">Target</text>
    </svg>
  );
}

// ─── Asset Class Donut Chart ──────────────────────────────────────────────────

function AssetDonut({ targets }: { targets: AssetClassTargets }) {
  const slices = (Object.keys(targets) as AssetClass[]).map((k) => ({
    key: k,
    label: ASSET_CLASS_LABELS[k],
    value: targets[k],
    color: ASSET_CLASS_COLORS[k],
  })).filter((s) => s.value > 0);

  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return null;

  const r = 38;
  const innerR = 22;
  const cx = 50;
  const cy = 50;
  let cumAngle = -Math.PI / 2;

  const arcs = slices.map((sl) => {
    const frac = sl.value / total;
    const angle = frac * Math.PI * 2;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + r * Math.cos(cumAngle);
    const y2 = cy + r * Math.sin(cumAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const ix1 = cx + innerR * Math.cos(cumAngle - angle);
    const iy1 = cy + innerR * Math.sin(cumAngle - angle);
    const ix2 = cx + innerR * Math.cos(cumAngle);
    const iy2 = cy + innerR * Math.sin(cumAngle);
    const d = `M${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} L${ix2},${iy2} A${innerR},${innerR} 0 ${largeArc} 0 ${ix1},${iy1} Z`;
    return { ...sl, d };
  });

  return (
    <svg viewBox="0 0 100 100" className="w-16 h-16 shrink-0">
      {arcs.map((arc) => (
        <path key={arc.key} d={arc.d} fill={arc.color} opacity={0.85} />
      ))}
      <text x={cx} y={cy + 3} textAnchor="middle" fontSize={8} fill="#9ca3af" fontWeight="600">
        Target
      </text>
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function RebalancingTool() {
  const positions = useTradingStore((s) => s.positions);
  const cash = useTradingStore((s) => s.cash);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);

  // ── State ──
  const [targetMode, setTargetMode] = useState<TargetMode>("assetClass");
  const [assetTargets, setAssetTargets] = useState<AssetClassTargets>({
    usStocks: 60,
    intlStocks: 20,
    bonds: 15,
    cash: 5,
  });
  const [tickerTargets, setTickerTargets] = useState<TickerTarget[]>([]);
  const [lockedAssets, setLockedAssets] = useState<Set<AssetClass>>(new Set());
  const [driftThreshold, setDriftThreshold] = useState(DRIFT_THRESHOLD_DEFAULT);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simMoves, setSimMoves] = useState({ usStocks: 0, intlStocks: 0, bonds: 0, cash: 0 });
  const [activeSection, setActiveSection] = useState<"setup" | "analysis" | "plan" | "history">("setup");
  const [rebalancingHistory] = useState<RebalancingEvent[]>(generateHistory());

  // ── Derived: total portfolio value ──
  const totalValue = useMemo(() => {
    const posValue = positions.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0);
    return posValue + cash;
  }, [positions, cash]);

  // ── Ticker targets initialization ──
  const initializedTickerTargets = useMemo<TickerTarget[]>(() => {
    if (tickerTargets.length === 0 && positions.length > 0) {
      const equal = 100 / (positions.length + 1); // +1 for cash
      return [
        ...positions.map((p) => ({ ticker: p.ticker, target: parseFloat(equal.toFixed(1)), locked: false })),
        { ticker: "CASH", target: parseFloat(equal.toFixed(1)), locked: false },
      ];
    }
    return tickerTargets;
  }, [positions, tickerTargets]);

  // ── Compute holding rows ──
  const holdingRows = useMemo<HoldingRow[]>(() => {
    if (totalValue === 0) return [];

    const rows: HoldingRow[] = positions.map((p, idx) => {
      const currentValue = p.currentPrice * p.quantity;
      const currentWeight = (currentValue / totalValue) * 100;

      let targetWeight = 0;
      if (targetMode === "assetClass") {
        // Distribute US stocks target equally among all equity positions
        const equityPositions = positions.length;
        targetWeight = equityPositions > 0 ? assetTargets.usStocks / equityPositions : 0;
      } else {
        const found = initializedTickerTargets.find((t) => t.ticker === p.ticker);
        targetWeight = found ? found.target : 0;
      }

      const deviation = currentWeight - targetWeight;
      const dollarDiff = (deviation / 100) * totalValue;
      const action: "buy" | "sell" | "hold" =
        Math.abs(deviation) < 0.5 ? "hold" : deviation > 0 ? "sell" : "buy";

      return {
        ticker: p.ticker,
        currentValue,
        currentWeight,
        targetWeight,
        deviation,
        action,
        dollarDiff,
        side: p.side,
        avgPrice: p.avgPrice,
        quantity: p.quantity,
        unrealizedPnL: p.unrealizedPnL,
        openedAtTimestamp: p.openedAtTimestamp,
      };
    });

    // Add cash row
    const cashWeight = (cash / totalValue) * 100;
    const cashTarget = targetMode === "assetClass" ? assetTargets.cash : (() => {
      const found = initializedTickerTargets.find((t) => t.ticker === "CASH");
      return found ? found.target : 0;
    })();
    const cashDev = cashWeight - cashTarget;
    rows.push({
      ticker: "CASH",
      currentValue: cash,
      currentWeight: cashWeight,
      targetWeight: cashTarget,
      deviation: cashDev,
      action: Math.abs(cashDev) < 0.5 ? "hold" : cashDev > 0 ? "sell" : "buy",
      dollarDiff: (cashDev / 100) * totalValue,
      side: "long",
      avgPrice: 1,
      quantity: cash,
      unrealizedPnL: 0,
    });

    return rows;
  }, [positions, cash, totalValue, targetMode, assetTargets, initializedTickerTargets]);

  // ── Drift score ──
  const driftScore = useMemo(() => {
    if (holdingRows.length === 0) return 0;
    const sum = holdingRows.reduce((s, r) => s + Math.abs(r.deviation), 0);
    return sum / holdingRows.length;
  }, [holdingRows]);

  const needsRebalancing = holdingRows.some((r) => Math.abs(r.deviation) > driftThreshold);

  // ── Trade plan ──
  const tradePlan = useMemo<TradeAction[]>(() => {
    if (totalValue === 0) return [];

    const actions: TradeAction[] = holdingRows
      .filter((r) => r.ticker !== "CASH" && r.action !== "hold" && Math.abs(r.deviation) >= driftThreshold)
      .map((r) => {
        const targetValue = (r.targetWeight / 100) * totalValue;
        const dollarAmount = Math.abs(r.dollarDiff);
        const estimatedShares = r.avgPrice > 0 ? Math.round(dollarAmount / r.avgPrice) : 0;
        const isLosser = r.unrealizedPnL < 0;
        const heldLessThanYear = isHeldLessThanYear(r.openedAtTimestamp);

        return {
          ticker: r.ticker,
          action: r.action as "buy" | "sell",
          currentValue: r.currentValue,
          targetValue,
          dollarAmount,
          estimatedShares,
          currentPrice: r.avgPrice,
          priority: r.action === "sell" ? (isLosser ? 1 : 2) : 3,
          isLosser,
          heldLessThanYear,
        };
      });

    // Sort: sell losers first (tax loss harvesting), then other sells, then buys
    return actions.sort((a, b) => a.priority - b.priority);
  }, [holdingRows, totalValue, driftThreshold]);

  const totalTrades = tradePlan.length;
  const estimatedCost = totalTrades * COMMISSION_PER_TRADE;

  // ── Asset class slider update ──
  const updateAssetTarget = useCallback((key: AssetClass, newVal: number) => {
    setAssetTargets((prev) => {
      const locked = lockedAssets;
      const remaining = 100 - newVal;
      const otherKeys = (Object.keys(prev) as AssetClass[]).filter((k) => k !== key && !locked.has(k));
      const otherSum = otherKeys.reduce((s, k) => s + prev[k], 0);

      const updated = { ...prev, [key]: newVal };
      if (otherSum > 0) {
        otherKeys.forEach((k) => {
          updated[k] = Math.max(0, Math.round((prev[k] / otherSum) * remaining));
        });
      }

      // Ensure sum = 100
      const total = (Object.keys(updated) as AssetClass[]).reduce((s, k) => s + updated[k], 0);
      const diff = 100 - total;
      if (diff !== 0 && otherKeys.length > 0) {
        updated[otherKeys[otherKeys.length - 1]] = Math.max(0, updated[otherKeys[otherKeys.length - 1]] + diff);
      }

      return updated;
    });
  }, [lockedAssets]);

  const assetSum = (Object.values(assetTargets) as number[]).reduce((s, v) => s + v, 0);

  // ── Simulated drift ──
  const simulatedHoldings = useMemo(() => {
    return holdingRows.map((r) => {
      let simMove = 0;
      if (targetMode === "assetClass") {
        // Use US stocks move for equity positions, bonds for bonds, etc.
        simMove = r.ticker === "CASH" ? simMoves.cash : simMoves.usStocks;
      } else {
        simMove = simMoves.usStocks;
      }
      const newValue = r.currentValue * (1 + simMove / 100);
      return { ...r, simValue: newValue };
    });
  }, [holdingRows, simMoves, targetMode]);

  const simTotal = simulatedHoldings.reduce((s, r) => s + r.simValue, 0);
  const simDrift = useMemo(() => {
    if (simTotal === 0) return 0;
    const sum = simulatedHoldings.reduce((s, r) => {
      const simWeight = (r.simValue / simTotal) * 100;
      return s + Math.abs(simWeight - r.targetWeight);
    }, 0);
    return simulatedHoldings.length > 0 ? sum / simulatedHoldings.length : 0;
  }, [simulatedHoldings, simTotal]);

  // ── Pro-rata distribution for ticker targets ──
  const applyProRata = useCallback(() => {
    const locked = initializedTickerTargets.filter((t) => t.locked);
    const lockedSum = locked.reduce((s, t) => s + t.target, 0);
    const remaining = 100 - lockedSum;
    const unlocked = initializedTickerTargets.filter((t) => !t.locked);
    const perItem = unlocked.length > 0 ? remaining / unlocked.length : 0;
    setTickerTargets(
      initializedTickerTargets.map((t) =>
        t.locked ? t : { ...t, target: parseFloat(perItem.toFixed(1)) }
      )
    );
  }, [initializedTickerTargets]);

  // ── No positions fallback ──
  if (positions.length === 0) {
    return (
      <div className="rounded-lg border border-border/40 bg-card/50 p-6 text-center">
        <RefreshCw className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">No positions to rebalance</p>
        <p className="text-[11px] text-muted-foreground/60 mt-1">Open some trades first, then come back to set targets.</p>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Navigation pills */}
      <div className="flex gap-1 overflow-x-auto">
        {(["setup", "analysis", "plan", "history"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActiveSection(s)}
            className={cn(
              "rounded-md px-3 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors",
              activeSection === s
                ? "bg-primary text-primary-foreground"
                : "bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground",
            )}
          >
            {s === "setup" && "Target Setup"}
            {s === "analysis" && "Analysis"}
            {s === "plan" && "Trade Plan"}
            {s === "history" && "History"}
          </button>
        ))}
      </div>

      {/* ── Section 1: Target Setup ─────────────────────────────────────────── */}
      {activeSection === "setup" && (
        <div className="space-y-3">
          {/* Strategy Presets */}
          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-primary" />
                Strategy Presets
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(STRATEGY_PRESETS) as [StrategyPreset, typeof STRATEGY_PRESETS[StrategyPreset]][]).map(
                  ([key, preset]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setAssetTargets({
                          usStocks: preset.usStocks,
                          intlStocks: preset.intlStocks,
                          bonds: preset.bonds,
                          cash: preset.cash,
                        });
                        setTargetMode("assetClass");
                      }}
                      className="rounded-md border border-border/40 bg-background/50 p-2.5 text-left hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    >
                      <p className="text-[11px] font-semibold">{preset.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{preset.description}</p>
                      <div className="mt-1.5 flex gap-1 flex-wrap">
                        <span className="rounded bg-primary/15 px-1 text-[11px] text-primary">{preset.usStocks}% US</span>
                        <span className="rounded bg-emerald-500/15 px-1 text-[11px] text-emerald-400">{preset.bonds}% Bond</span>
                      </div>
                    </button>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Target Mode Toggle */}
          <div className="flex items-center gap-2 rounded-md bg-card/60 p-1">
            <button
              type="button"
              onClick={() => setTargetMode("assetClass")}
              className={cn(
                "flex-1 rounded py-1 text-[11px] font-medium transition-colors",
                targetMode === "assetClass" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              Asset Class
            </button>
            <button
              type="button"
              onClick={() => setTargetMode("ticker")}
              className={cn(
                "flex-1 rounded py-1 text-[11px] font-medium transition-colors",
                targetMode === "ticker" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              Ticker-Level
            </button>
          </div>

          {/* Asset Class Sliders */}
          {targetMode === "assetClass" && (
            <Card className="border-border/40 bg-card/50">
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5 text-primary" />
                    Asset Class Targets
                  </CardTitle>
                  <div className="flex items-center gap-1.5">
                    <AssetDonut targets={assetTargets} />
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        Math.abs(assetSum - 100) < 1 ? "border-emerald-500/30 text-emerald-400" : "border-red-500/30 text-red-400",
                      )}
                    >
                      {assetSum}% total
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-4">
                {(Object.keys(assetTargets) as AssetClass[]).map((key) => (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setLockedAssets((prev) => {
                              const next = new Set(prev);
                              if (next.has(key)) next.delete(key);
                              else next.add(key);
                              return next;
                            });
                          }}
                          className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                        >
                          {lockedAssets.has(key) ? (
                            <Lock className="h-3 w-3 text-amber-400" />
                          ) : (
                            <Unlock className="h-3 w-3" />
                          )}
                        </button>
                        <span className="text-[11px] font-medium">{ASSET_CLASS_LABELS[key]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold tabular-nums" style={{ color: ASSET_CLASS_COLORS[key] }}>
                          {assetTargets[key]}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency((assetTargets[key] / 100) * portfolioValue)}
                        </span>
                      </div>
                    </div>
                    <Slider
                      value={[assetTargets[key]]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([v]) => { if (!lockedAssets.has(key)) updateAssetTarget(key, v); }}
                      className={cn(lockedAssets.has(key) && "opacity-40 pointer-events-none")}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Ticker-Level Targets */}
          {targetMode === "ticker" && (
            <Card className="border-border/40 bg-card/50">
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold">Ticker Targets</CardTitle>
                  <Button variant="outline" size="sm" onClick={applyProRata} className="h-6 text-xs">
                    Pro-rata
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2">
                {initializedTickerTargets.map((tt) => (
                  <div key={tt.ticker} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTickerTargets(
                          initializedTickerTargets.map((t) =>
                            t.ticker === tt.ticker ? { ...t, locked: !t.locked } : t
                          )
                        );
                      }}
                      className="shrink-0 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                    >
                      {tt.locked ? <Lock className="h-3 w-3 text-amber-400" /> : <Unlock className="h-3 w-3" />}
                    </button>
                    <span className="w-12 shrink-0 text-[11px] font-semibold">{tt.ticker}</span>
                    <Slider
                      value={[tt.target]}
                      min={0}
                      max={100}
                      step={0.5}
                      onValueChange={([v]) => { if (tt.locked) return; setTickerTargets(
                          initializedTickerTargets.map((t) =>
                            t.ticker === tt.ticker ? { ...t, target: v } : t
                          )
                        );
                      }}
                      className={cn("flex-1", tt.locked && "opacity-40")}
                    />
                    <span className="w-10 shrink-0 text-right text-[11px] font-semibold tabular-nums text-primary">
                      {tt.target.toFixed(1)}%
                    </span>
                  </div>
                ))}
                <div className="pt-1 border-t border-border/40">
                  <p className="text-xs text-muted-foreground">
                    Total: {initializedTickerTargets.reduce((s, t) => s + t.target, 0).toFixed(1)}%
                    {Math.abs(initializedTickerTargets.reduce((s, t) => s + t.target, 0) - 100) > 1 && (
                      <span className="ml-1 text-amber-400">(must sum to 100%)</span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Drift Threshold */}
          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                Rebalancing Threshold
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Only rebalance if drift exceeds</span>
                <span className="text-[11px] font-semibold text-primary">{driftThreshold}%</span>
              </div>
              <Slider
                value={[driftThreshold]}
                min={1}
                max={20}
                step={1}
                onValueChange={([v]) => setDriftThreshold(v)}
              />
              <div className="rounded-md bg-primary/8 border border-border/40 p-2.5 space-y-1">
                <p className="text-xs font-medium text-primary">Threshold vs Calendar Rebalancing</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Threshold (5%)</strong> — only rebalance when a position drifts more than 5% from target.
                  Reduces over-trading and tax events. Research shows 5% threshold achieves ~85% of the benefit with ~40% fewer trades.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Calendar (quarterly)</strong> — rebalance on a fixed schedule regardless of drift.
                  Simpler but may trigger unnecessary trades in calm markets.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Section 2: Analysis ──────────────────────────────────────────────── */}
      {activeSection === "analysis" && (
        <div className="space-y-3">
          {/* Drift Score Banner */}
          <div className={cn(
            "flex items-center gap-3 rounded-lg border p-3",
            needsRebalancing
              ? "border-red-500/30 bg-red-500/8"
              : "border-emerald-500/30 bg-emerald-500/8",
          )}>
            {needsRebalancing ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            ) : (
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
            )}
            <div className="flex-1">
              <p className={cn("text-[11px] font-semibold", needsRebalancing ? "text-red-400" : "text-emerald-400")}>
                {needsRebalancing ? "Rebalancing Recommended" : "Portfolio On Target"}
              </p>
              <p className="text-xs text-muted-foreground">
                Average drift: {driftScore.toFixed(1)}% — threshold: {driftThreshold}%
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn("text-xs shrink-0", needsRebalancing ? "border-red-500/30 text-red-400" : "border-emerald-500/30 text-emerald-400")}
            >
              Drift: {driftScore.toFixed(1)}%
            </Badge>
          </div>

          {/* Holdings Table */}
          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-semibold">Current vs Target Weights</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Ticker</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Current</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Target</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Drift</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdingRows.map((row) => (
                      <tr key={row.ticker} className="border-b border-border/20 last:border-0">
                        <td className="px-3 py-2 font-semibold">{row.ticker}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{fmtAbs(row.currentWeight)}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{fmtAbs(row.targetWeight)}</td>
                        <td className={cn("px-3 py-2 text-right tabular-nums font-medium", getDriftColor(row.deviation))}>
                          {fmtPct(row.deviation)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {row.action === "hold" ? (
                            <Badge variant="outline" className="text-[11px] border-muted-foreground/30 text-muted-foreground">
                              <Minus className="h-2.5 w-2.5 mr-0.5" />
                              Hold
                            </Badge>
                          ) : row.action === "buy" ? (
                            <Badge variant="outline" className="text-[11px] border-emerald-500/30 text-emerald-400">
                              <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                              Buy {formatCurrency(Math.abs(row.dollarDiff))}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[11px] border-red-500/30 text-red-400">
                              <TrendingDown className="h-2.5 w-2.5 mr-0.5" />
                              Sell {formatCurrency(Math.abs(row.dollarDiff))}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-primary" />
                Weight Comparison — Current vs Target
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <GroupedBarChart rows={holdingRows} />
            </CardContent>
          </Card>

          {/* Deviation breakdown */}
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: "On Target",
                count: holdingRows.filter((r) => Math.abs(r.deviation) <= 2).length,
                className: "border-emerald-500/30 bg-emerald-500/8 text-emerald-400",
              },
              {
                label: "Minor Drift",
                count: holdingRows.filter((r) => Math.abs(r.deviation) > 2 && Math.abs(r.deviation) <= 5).length,
                className: "border-amber-500/30 bg-amber-500/8 text-amber-400",
              },
              {
                label: "Major Drift",
                count: holdingRows.filter((r) => Math.abs(r.deviation) > 5).length,
                className: "border-red-500/30 bg-red-500/8 text-red-400",
              },
            ].map((item) => (
              <div key={item.label} className={cn("rounded-lg border p-2.5 text-center", item.className.split(" ").slice(0, 2).join(" "))}>
                <p className={cn("text-xl font-bold tabular-nums", item.className.split(" ").slice(2).join(" "))}>{item.count}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
                <p className="text-[11px] text-muted-foreground/60">
                  {item.label === "On Target" ? "<2%" : item.label === "Minor Drift" ? "2–5%" : ">5%"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section 3: Trade Plan ────────────────────────────────────────────── */}
      {activeSection === "plan" && (
        <div className="space-y-3">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 bg-card/50 p-2.5">
              <p className="text-xs text-muted-foreground">Trades Needed</p>
              <p className="text-base font-bold tabular-nums">{totalTrades}</p>
            </div>
            <div className="rounded-lg border border-border/40 bg-card/50 p-2.5">
              <p className="text-xs text-muted-foreground">Est. Cost</p>
              <p className="text-base font-bold tabular-nums">{formatCurrency(estimatedCost)}</p>
            </div>
            <div className="rounded-lg border border-border/40 bg-card/50 p-2.5">
              <p className="text-xs text-muted-foreground">Drift Score</p>
              <p className={cn("text-base font-bold tabular-nums", getDriftColor(driftScore - 0))}>
                {driftScore.toFixed(1)}%
              </p>
            </div>
          </div>

          {totalTrades === 0 ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/8 p-4 text-center">
              <CheckCircle className="mx-auto mb-2 h-6 w-6 text-emerald-400" />
              <p className="text-[11px] font-semibold text-emerald-400">No rebalancing needed</p>
              <p className="text-xs text-muted-foreground mt-1">
                All positions are within the {driftThreshold}% threshold
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Tax efficiency note */}
              <div className="rounded-md bg-amber-500/8 border border-amber-500/20 p-2.5">
                <p className="text-xs font-medium text-amber-400 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Tax Efficiency Order
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sells are ordered: losing positions first (harvest losses), then winners. Positions held &lt;1 year flagged for short-term tax rates.
                </p>
              </div>

              {/* Trade list */}
              {tradePlan.map((trade, idx) => (
                <div
                  key={`${trade.ticker}-${idx}`}
                  className={cn(
                    "rounded-lg border p-3 space-y-1.5",
                    trade.action === "sell"
                      ? "border-red-500/20 bg-red-500/5"
                      : "border-emerald-500/20 bg-emerald-500/5",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[11px] font-bold",
                          trade.action === "sell"
                            ? "border-red-500/30 text-red-400"
                            : "border-emerald-500/30 text-emerald-400",
                        )}
                      >
                        {trade.action === "sell" ? "SELL" : "BUY"}
                      </Badge>
                      <span className="text-[12px] font-bold">{trade.ticker}</span>
                      {trade.isLosser && trade.action === "sell" && (
                        <Badge variant="outline" className="text-[11px] border-border/40 text-primary">
                          Tax Loss
                        </Badge>
                      )}
                      {trade.heldLessThanYear && trade.action === "sell" && (
                        <Badge variant="outline" className="text-[11px] border-amber-500/30 text-amber-400">
                          ST Tax
                        </Badge>
                      )}
                    </div>
                    <span className={cn(
                      "text-[11px] font-semibold tabular-nums",
                      trade.action === "sell" ? "text-red-400" : "text-emerald-400",
                    )}>
                      {trade.action === "sell" ? "-" : "+"}{formatCurrency(trade.dollarAmount)}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>Current: {formatCurrency(trade.currentValue)}</span>
                    <span>Target: {formatCurrency(trade.targetValue)}</span>
                    <span>~{trade.estimatedShares} shares @ {formatCurrency(trade.currentPrice)}</span>
                  </div>
                </div>
              ))}

              {/* Priority legend */}
              <div className="rounded-md bg-card/60 border border-border/40 p-2.5 text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Execution Order</p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Sell losing positions (realize tax losses first)</li>
                  <li>Sell winning positions to raise remaining cash</li>
                  <li>Buy underweight positions with available cash</li>
                </ol>
              </div>
            </div>
          )}

          {/* Dollar Cost Averaging Alternative */}
          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                DCA Alternative
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Instead of lump-sum rebalancing, consider <strong className="text-foreground">Dollar Cost Averaging</strong>: direct new contributions into underweight positions. This avoids selling appreciated assets (and their tax consequences) while gradually moving toward your target allocation. Ideal when deviation is mild (&lt;10%) and you have regular income to invest.
              </p>
              <div className="mt-2 space-y-1">
                {holdingRows
                  .filter((r) => r.action === "buy" && r.ticker !== "CASH")
                  .map((r) => (
                    <div key={r.ticker} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Direct next purchase to <strong className="text-foreground">{r.ticker}</strong></span>
                      <span className="text-emerald-400">{formatCurrency(Math.abs(r.dollarDiff))} needed</span>
                    </div>
                  ))}
                {holdingRows.filter((r) => r.action === "buy" && r.ticker !== "CASH").length === 0 && (
                  <p className="text-xs text-muted-foreground/60 italic">No underweight positions requiring DCA</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Section 4: History & Simulator ──────────────────────────────────── */}
      {activeSection === "history" && (
        <div className="space-y-3">
          {/* Expected benefit */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border/40 bg-card/50 p-3">
              <p className="text-xs text-muted-foreground mb-1">Expected Annual Benefit</p>
              <p className="text-sm font-bold text-emerald-400">+0.25–0.50%</p>
              <p className="text-xs text-muted-foreground">Higher returns via reduced variance drag</p>
            </div>
            <div className="rounded-lg border border-border/40 bg-card/50 p-3">
              <p className="text-xs text-muted-foreground mb-1">Tax Drag (est.)</p>
              <p className="text-sm font-bold text-amber-400">−0.10–0.30%</p>
              <p className="text-xs text-muted-foreground">From selling appreciated positions annually</p>
            </div>
          </div>

          {/* Drift chart */}
          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-primary" />
                Portfolio Drift Over Time
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <DriftChart history={rebalancingHistory} currentDrift={driftScore} />
              <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-primary rounded" />Drift level</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />Rebalance event</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-red-500 rounded" />5% threshold</span>
              </div>
            </CardContent>
          </Card>

          {/* Rebalancing history log */}
          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Rebalancing History
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Date</th>
                    <th className="px-3 py-2 text-center font-medium text-muted-foreground">Trades</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Post-Drift</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {rebalancingHistory.map((event) => (
                    <tr key={event.id} className="border-b border-border/20 last:border-0">
                      <td className="px-3 py-2 text-muted-foreground">{event.date}</td>
                      <td className="px-3 py-2 text-center font-semibold">{event.numTrades}</td>
                      <td className="px-3 py-2 text-right">
                        <span className={cn("font-semibold tabular-nums", getDriftColor(event.postDriftScore))}>
                          {event.postDriftScore.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                        {formatCurrency(event.estimatedCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Drift Simulator */}
          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-0 pt-3 px-3">
              <button
                type="button"
                onClick={() => setShowSimulator((s) => !s)}
                className="flex w-full items-center justify-between"
              >
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  Drift Simulator
                </CardTitle>
                {showSimulator ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
            </CardHeader>
            {showSimulator && (
              <CardContent className="px-3 pb-3 pt-2 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Simulate market moves to see projected drift and when the threshold would be triggered.
                </p>

                {(["usStocks", "intlStocks", "bonds", "cash"] as const).map((key) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span>{ASSET_CLASS_LABELS[key]}</span>
                      <span className={cn("font-semibold tabular-nums", simMoves[key] >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {simMoves[key] >= 0 ? "+" : ""}{simMoves[key]}%
                      </span>
                    </div>
                    <Slider
                      value={[simMoves[key]]}
                      min={-50}
                      max={50}
                      step={1}
                      onValueChange={([v]) => setSimMoves((prev) => ({ ...prev, [key]: v }))}
                    />
                  </div>
                ))}

                {/* Sim results */}
                <div className={cn(
                  "rounded-lg border p-3 space-y-1",
                  simDrift > driftThreshold
                    ? "border-red-500/30 bg-red-500/8"
                    : "border-emerald-500/30 bg-emerald-500/8",
                )}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium">Projected Drift Score</span>
                    <span className={cn("text-[11px] font-bold tabular-nums", simDrift > driftThreshold ? "text-red-400" : "text-emerald-400")}>
                      {simDrift.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium">Projected Portfolio Value</span>
                    <span className="text-[11px] font-bold tabular-nums">{formatCurrency(simTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium">Rebalance Triggered?</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        simDrift > driftThreshold
                          ? "border-red-500/30 text-red-400"
                          : "border-emerald-500/30 text-emerald-400",
                      )}
                    >
                      {simDrift > driftThreshold ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>

                {/* Per-position sim breakdown */}
                <div className="space-y-1">
                  {simulatedHoldings.map((r) => {
                    const simWeight = simTotal > 0 ? (r.simValue / simTotal) * 100 : 0;
                    const simDev = simWeight - r.targetWeight;
                    return (
                      <div key={r.ticker} className="flex items-center gap-2 text-xs">
                        <span className="w-12 shrink-0 font-semibold">{r.ticker}</span>
                        <span className="text-muted-foreground">{simWeight.toFixed(1)}%</span>
                        <span className="text-muted-foreground">→ tgt {r.targetWeight.toFixed(1)}%</span>
                        <span className={cn("ml-auto font-medium", getDriftColor(simDev))}>
                          {fmtPct(simDev)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
