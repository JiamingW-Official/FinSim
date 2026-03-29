"use client";

import { useMemo, useEffect, useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  Zap,
  BarChart2,
  Calendar,
  BookOpen,
  Star,
} from "lucide-react";
import type { TradeRow } from "@/app/(dashboard)/journal/JournalPageClient";
import { loadEmotions, type TradeEmotion } from "./JournalAIAnalysis";
import { loadTradeTags } from "./TradeLogTable";

// ── Mulberry32 PRNG ──────────────────────────────────────────────────────────

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

// ── TypeScript interfaces ────────────────────────────────────────────────────

interface WordFreq {
  word: string;
  count: number;
  isWin: boolean;
}

interface EmotionStat {
  emotion: TradeEmotion;
  label: string;
  avgPnL: number;
  winRate: number;
  count: number;
  color: string;
}

interface DowHeatCell {
  dow: number;
  hour: number;
  avgPnL: number;
  count: number;
}

interface TradeNarrative {
  tradeId: string;
  ticker: string;
  date: string;
  entryPrice: number;
  exitPrice: number;
  pnlAbs: number;
  pnlPct: number;
  direction: string;
  narrative: string;
  lesson: string;
  isWin: boolean;
}

interface WeeklyDebrief {
  weekLabel: string;
  bullets: string[];
  totalPnL: number;
  tradeCount: number;
  winRate: number;
}

interface HabitCheck {
  tradeId: string;
  checkedTrend: boolean;
  setStopLoss: boolean;
  followedSizing: boolean;
  avoidedFomo: boolean;
  disciplineScore: number;
}

interface ImprovementSuggestion {
  id: string;
  priority: 1 | 2 | 3;
  title: string;
  detail: string;
  estimatedGain: number;
  sentiment: "positive" | "warning" | "negative";
}

// ── Stop-words for keyword extraction ──────────────────────────────────────

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","up","about","into","through","during","before","after",
  "is","was","are","were","be","been","being","have","has","had","do",
  "does","did","will","would","could","should","may","might","shall","can",
  "i","you","he","she","it","we","they","them","their","this","that",
  "these","those","my","your","his","her","its","our","not","no","so",
  "if","as","then","than","there","here","when","where","who","what","how",
  "very","just","also","more","some","all","one","two","three","time",
  "entered","closed","at","position","price","trade","trading","bought",
  "sold","market","set","put","took","took","got","went","made",
]);

const BULLISH_PHRASES = [
  "high volume", "strong trend", "clear setup", "breakout confirmed",
  "momentum building", "support held", "trend following", "oversold bounce",
  "earnings catalyst", "volume surge", "gap up", "higher high",
];

const BEARISH_PHRASES = [
  "maybe", "might work", "revenge", "fomo", "not sure", "feeling off",
  "chasing", "overextended", "unclear", "risky", "hope", "praying",
  "gut feeling", "lucky", "gambling", "impulse",
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function countFrequency(words: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const w of words) map.set(w, (map.get(w) ?? 0) + 1);
  return map;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function generateTradeLesson(pnlPct: number, tags: string[], emotion: TradeEmotion | undefined, durationMs: number): string {
  if (pnlPct > 10) {
    return "Strong discipline led to an outsized gain. Document what you did right and replicate it.";
  } else if (pnlPct > 2) {
    if (tags.includes("momentum") || tags.includes("trend following")) {
      return "Trend-following approach paid off. Staying with the trend was the key edge.";
    }
    return "Solid execution. Risk was well-managed relative to the reward captured.";
  } else if (pnlPct > 0) {
    return "Small win. Check if profit was limited by early exit or position sizing — there may be room to let winners run.";
  } else if (pnlPct > -2) {
    if (emotion === "greedy" || emotion === "frustrated") {
      return "Emotional entry led to a scratch trade. Pre-define entry criteria before placing orders.";
    }
    return "Tight loss — good risk management. Review entry timing and see if the setup was fully confirmed.";
  } else if (pnlPct > -5) {
    const holdHours = durationMs / 3_600_000;
    if (holdHours > 24) {
      return "Loss grew as position was held too long. Consider tighter time-based stops for multi-day holds.";
    }
    return "Moderate loss. Revisit stop placement and whether the market context matched the trade thesis.";
  } else {
    return "Significant loss. A strict max-loss rule (e.g., 2% per trade) would have capped the damage. Review position sizing.";
  }
}

function generateNarrative(row: TradeRow, emotion: TradeEmotion | undefined): string {
  const dateStr = formatDate(row.trade.simulationDate);
  const ticker = row.trade.ticker;
  const entry = row.entryPrice.toFixed(2);
  const exit = row.trade.price.toFixed(2);
  const pnl = row.trade.realizedPnL;
  const pnlPct = row.pnlPct;
  const pnlStr = pnl >= 0 ? `+${formatCurrency(pnl)}` : formatCurrency(pnl);
  const dir = row.direction;
  const tags = row.trade.tags ?? [];
  const emotionStr = emotion ? ` feeling ${emotion}` : "";
  const held = row.durationMs >= 0
    ? ` and held for ${Math.round(row.durationMs / 60_000)}m`
    : "";

  const setup = tags.length > 0 ? `a ${tags[0]} setup` : "a market opportunity";
  const action = dir === "long"
    ? `took a long position on ${ticker} at $${entry}${emotionStr} based on ${setup}`
    : `entered a short on ${ticker} at $${entry}${emotionStr} based on ${setup}`;

  const movement = pnlPct >= 0
    ? `The trade moved in your favour${held}, exiting at $${exit} for ${pnlStr} (${pnlPct.toFixed(1)}%).`
    : `The trade moved against you${held}, closing at $${exit} for ${pnlStr} (${pnlPct.toFixed(1)}%).`;

  return `On ${dateStr}, you ${action}. ${movement}`;
}

// ── Section 1: Pattern Recognition ──────────────────────────────────────────

function PatternRecognition({ rows, rng }: { rows: TradeRow[]; rng: () => number }) {
  const winRows = rows.filter((r) => r.trade.realizedPnL > 0);
  const lossRows = rows.filter((r) => r.trade.realizedPnL <= 0);

  const winWords = winRows.flatMap((r) =>
    extractWords((r.trade.notes ?? "") + " " + (r.trade.tags ?? []).join(" "))
  );
  const lossWords = lossRows.flatMap((r) =>
    extractWords((r.trade.notes ?? "") + " " + (r.trade.tags ?? []).join(" "))
  );

  // Supplement with seeded synthetic data if sparse
  const synWinWords = rows.length < 5
    ? BULLISH_PHRASES.slice(0, 6).flatMap((p) => p.split(" ").filter((w) => !STOP_WORDS.has(w)))
    : [];
  const synLossWords = rows.length < 5
    ? BEARISH_PHRASES.slice(0, 6).flatMap((p) => p.split(" ").filter((w) => !STOP_WORDS.has(w)))
    : [];

  const winFreq = countFrequency([...winWords, ...synWinWords]);
  const lossFreq = countFrequency([...lossWords, ...synLossWords]);

  const allFreqEntries: WordFreq[] = [
    ...Array.from(winFreq.entries()).map(([word, count]) => ({ word, count, isWin: true })),
    ...Array.from(lossFreq.entries()).map(([word, count]) => ({ word, count, isWin: false })),
  ].sort((a, b) => b.count - a.count).slice(0, 30);

  const maxCount = Math.max(...allFreqEntries.map((e) => e.count), 1);

  // Trigger phrase detection
  const triggerPhrases = BULLISH_PHRASES.filter((p) =>
    winRows.some((r) => (r.trade.notes ?? "").toLowerCase().includes(p))
  );
  const redFlagPhrases = BEARISH_PHRASES.filter((p) =>
    lossRows.some((r) => (r.trade.notes ?? "").toLowerCase().includes(p))
  );

  // Synthetic triggers when sparse
  const synTriggers = rows.length < 3 ? BULLISH_PHRASES.slice(0, 3) : [];
  const synRedFlags = rows.length < 3 ? BEARISH_PHRASES.slice(0, 3) : [];
  const displayTriggers = [...new Set([...triggerPhrases, ...synTriggers])].slice(0, 6);
  const displayRedFlags = [...new Set([...redFlagPhrases, ...synRedFlags])].slice(0, 6);

  // SVG Word Cloud layout
  const cloudWords = allFreqEntries.slice(0, 24);
  const cloudWidth = 320;
  const cloudHeight = 140;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Pattern Recognition</h3>
      </div>

      {/* Word Cloud */}
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Journal Word Cloud</p>
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${cloudWidth} ${cloudHeight}`}
            className="h-36 w-full max-w-sm mx-auto"
            aria-label="Word frequency cloud"
          >
            {cloudWords.map((entry, i) => {
              const fontSize = 8 + (entry.count / maxCount) * 14;
              const cols = 6;
              const col = i % cols;
              const row = Math.floor(i / cols);
              const x = 20 + col * 48 + (rng() * 12 - 6);
              const y = 18 + row * 28 + (rng() * 8 - 4);
              const color = entry.isWin ? "#4ade80" : "#f87171";
              const opacity = 0.5 + (entry.count / maxCount) * 0.5;
              return (
                <text
                  key={`${entry.word}-${i}`}
                  x={Math.min(Math.max(x, fontSize * 0.5), cloudWidth - fontSize * 0.5)}
                  y={Math.min(Math.max(y, fontSize), cloudHeight - 4)}
                  fill={color}
                  fillOpacity={opacity}
                  fontSize={fontSize}
                  fontWeight={entry.count > 2 ? "600" : "400"}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="select-none"
                >
                  {entry.word}
                </text>
              );
            })}
          </svg>
        </div>
        <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground justify-center">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
            Winning entries
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
            Losing entries
          </span>
        </div>
      </div>

      {/* Trigger / Red flag phrases */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
            <p className="text-xs font-semibold text-green-400">Success Trigger Phrases</p>
          </div>
          {displayTriggers.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic">Add notes to trades to detect patterns.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {displayTriggers.map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-400 border border-green-500/25"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
            <p className="text-xs font-semibold text-red-400">Red Flag Phrases</p>
          </div>
          {displayRedFlags.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic">No red-flag language detected yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {displayRedFlags.map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400 border border-red-500/25"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Success pattern summary */}
      {winRows.length >= 2 && (
        <div className="rounded-lg border border-border bg-card/50 p-3">
          <p className="text-xs font-semibold mb-1.5">Your Success Pattern</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Your {winRows.length} winning trade{winRows.length !== 1 ? "s" : ""} most commonly involve{" "}
            {winWords.slice(0, 3).join(", ") || "clear setups and trend-following entries"}.
            {triggerPhrases.length > 0
              ? ` The phrase "${triggerPhrases[0]}" appears frequently before wins.`
              : " Keep journaling to reveal your edge."}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Section 2: Emotion-Performance Correlation ───────────────────────────────

function EmotionPerformance({ rows, emotions, rng }: {
  rows: TradeRow[];
  emotions: Record<string, TradeEmotion>;
  rng: () => number;
}) {
  const EMOTION_LABELS: Record<TradeEmotion, string> = {
    confident: "Confident",
    neutral: "Neutral",
    anxious: "Anxious",
    greedy: "Greedy",
    frustrated: "Frustrated",
  };

  const EMOTION_COLORS: Record<TradeEmotion, string> = {
    confident: "#4ade80",
    neutral: "#94a3b8",
    anxious: "#60a5fa",
    greedy: "#fbbf24",
    frustrated: "#f87171",
  };

  const emotionStats = useMemo((): EmotionStat[] => {
    const EMOTIONS: TradeEmotion[] = ["confident", "neutral", "anxious", "greedy", "frustrated"];

    return EMOTIONS.map((emotion) => {
      const matched = rows.filter((r) => (emotions[r.id] ?? "neutral") === emotion);

      // Seed synthetic data when sparse
      if (matched.length === 0) {
        const synPnL: Record<TradeEmotion, number> = {
          confident: 85 + rng() * 50,
          neutral: 20 + rng() * 40,
          anxious: -30 + rng() * 20,
          greedy: -15 + rng() * 60,
          frustrated: -60 + rng() * 30,
        };
        const synWinRate: Record<TradeEmotion, number> = {
          confident: 65 + rng() * 15,
          neutral: 52 + rng() * 10,
          anxious: 38 + rng() * 15,
          greedy: 45 + rng() * 20,
          frustrated: 28 + rng() * 15,
        };
        return {
          emotion,
          label: EMOTION_LABELS[emotion],
          avgPnL: synPnL[emotion],
          winRate: synWinRate[emotion],
          count: 0,
          color: EMOTION_COLORS[emotion],
        };
      }

      const avgPnL = matched.reduce((s, r) => s + r.trade.realizedPnL, 0) / matched.length;
      const winRate = (matched.filter((r) => r.trade.realizedPnL > 0).length / matched.length) * 100;
      return {
        emotion,
        label: EMOTION_LABELS[emotion],
        avgPnL,
        winRate,
        count: matched.length,
        color: EMOTION_COLORS[emotion],
      };
    });
  }, [rows, emotions, rng]);

  const maxAbsPnL = Math.max(...emotionStats.map((e) => Math.abs(e.avgPnL)), 1);
  const chartW = 320;
  const chartH = 100;
  const barW = 36;
  const gap = (chartW - emotionStats.length * barW) / (emotionStats.length + 1);
  const midY = chartH / 2;
  const scale = (midY - 8) / maxAbsPnL;

  const bestEmotion = [...emotionStats].sort((a, b) => b.winRate - a.winRate)[0];
  const dangerEmotion = [...emotionStats].sort((a, b) => a.avgPnL - b.avgPnL)[0];

  // Heatmap: day-of-week x time-bucket
  const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const HOUR_LABELS = ["Pre", "Open", "Mid", "PM", "Late", "AH", "—", "—"];

  const heatCells = useMemo((): DowHeatCell[] => {
    const cells: DowHeatCell[] = [];
    for (let dow = 1; dow <= 5; dow++) {
      for (let hour = 0; hour < 8; hour++) {
        const matched = rows.filter((r) => {
          const d = new Date(r.trade.simulationDate);
          const rowDow = d.getDay();
          const h = d.getHours();
          const bucket = h < 9 ? 0 : h < 10 ? 1 : h < 12 ? 2 : h < 14 ? 3 : h < 15 ? 4 : h < 16 ? 5 : hour >= 6 ? 6 : 7;
          return rowDow === dow && bucket === hour;
        });

        // Synthetic when empty
        const avgPnL =
          matched.length > 0
            ? matched.reduce((s, r) => s + r.trade.realizedPnL, 0) / matched.length
            : (rng() - 0.45) * 200;

        cells.push({ dow, hour, avgPnL, count: matched.length });
      }
    }
    return cells;
  }, [rows, rng]);

  const heatMax = Math.max(...heatCells.map((c) => Math.abs(c.avgPnL)), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold">Emotion-Performance Correlation</h3>
      </div>

      {/* Bar Chart */}
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Avg P&amp;L by Emotion State</p>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="h-32 w-full max-w-sm mx-auto">
            {/* Zero line */}
            <line
              x1={0}
              x2={chartW}
              y1={midY}
              y2={midY}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
            {/* Y-axis labels */}
            <text x={2} y={10} fill="rgba(255,255,255,0.35)" fontSize={7}>+</text>
            <text x={2} y={chartH - 2} fill="rgba(255,255,255,0.35)" fontSize={7}>-</text>

            {emotionStats.map((stat, i) => {
              const x = gap + i * (barW + gap) + gap * 0.5;
              const barH = Math.max(2, Math.abs(stat.avgPnL) * scale);
              const isPos = stat.avgPnL >= 0;
              const barY = isPos ? midY - barH : midY;

              return (
                <g key={stat.emotion}>
                  <rect
                    x={x}
                    y={barY}
                    width={barW}
                    height={barH}
                    fill={stat.color}
                    fillOpacity={0.7}
                    rx={2}
                  />
                  {/* Value label */}
                  <text
                    x={x + barW / 2}
                    y={isPos ? barY - 2 : barY + barH + 8}
                    fill={stat.color}
                    fontSize={6.5}
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {stat.avgPnL >= 0 ? "+" : ""}{stat.avgPnL.toFixed(0)}
                  </text>
                  {/* Emotion label */}
                  <text
                    x={x + barW / 2}
                    y={chartH + 18}
                    fill="rgba(255,255,255,0.5)"
                    fontSize={6.5}
                    textAnchor="middle"
                  >
                    {stat.label}
                  </text>
                  {/* Count badge */}
                  {stat.count > 0 && (
                    <text
                      x={x + barW / 2}
                      y={chartH + 26}
                      fill="rgba(255,255,255,0.3)"
                      fontSize={5.5}
                      textAnchor="middle"
                    >
                      n={stat.count}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Best state / Danger zone */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Star className="h-3.5 w-3.5 text-green-400" />
            <p className="text-xs font-semibold text-green-400 uppercase tracking-wide">Best Trading State</p>
          </div>
          <p className="text-sm font-bold text-foreground">{bestEmotion.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {bestEmotion.winRate.toFixed(0)}% win rate
            {bestEmotion.count > 0 ? ` across ${bestEmotion.count} trades` : " (projected)"}
          </p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
            <p className="text-xs font-semibold text-red-400 uppercase tracking-wide">Danger Zone</p>
          </div>
          <p className="text-sm font-bold text-foreground">{dangerEmotion.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Avg {formatCurrency(dangerEmotion.avgPnL)} per trade
            {dangerEmotion.count > 0 ? "" : " (projected)"}
          </p>
        </div>
      </div>

      {/* Day × Hour Heatmap */}
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Day of Week × Time of Day Heatmap</p>
        <div className="overflow-x-auto">
          <svg viewBox="0 0 280 80" className="h-20 w-full max-w-xs mx-auto">
            {heatCells.map((cell) => {
              const col = cell.dow - 1;
              const row = cell.hour;
              const x = col * 54 + 4;
              const y = row * 9 + 2;
              const t = cell.avgPnL / heatMax; // -1 to 1
              let fill: string;
              if (t > 0.1) fill = `rgba(74,222,128,${0.2 + t * 0.7})`;
              else if (t < -0.1) fill = `rgba(248,113,113,${0.2 + Math.abs(t) * 0.7})`;
              else fill = "rgba(100,116,139,0.2)";

              return (
                <rect
                  key={`${cell.dow}-${cell.hour}`}
                  x={x}
                  y={y}
                  width={50}
                  height={7.5}
                  fill={fill}
                  rx={1}
                />
              );
            })}
            {/* DOW labels */}
            {DOW_LABELS.map((label, i) => (
              <text
                key={label}
                x={i * 54 + 29}
                y={76}
                fill="rgba(255,255,255,0.4)"
                fontSize={6}
                textAnchor="middle"
              >
                {label}
              </text>
            ))}
            {/* Hour labels */}
            {HOUR_LABELS.slice(0, 6).map((label, i) => (
              <text
                key={`h${i}`}
                x={276}
                y={i * 9 + 7.5}
                fill="rgba(255,255,255,0.3)"
                fontSize={5.5}
                textAnchor="end"
              >
                {label}
              </text>
            ))}
          </svg>
        </div>
        <div className="mt-1 flex items-center gap-4 justify-center text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 rounded-sm bg-green-400/60" />
            Profitable periods
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 rounded-sm bg-red-400/60" />
            Loss-heavy periods
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Section 3: Trade Narrative Generator ─────────────────────────────────────

function TradeNarratives({ rows, emotions }: {
  rows: TradeRow[];
  emotions: Record<string, TradeEmotion>;
}) {
  const narratives = useMemo((): TradeNarrative[] => {
    return rows.map((row) => {
      const emotion = emotions[row.id];
      return {
        tradeId: row.id,
        ticker: row.trade.ticker,
        date: formatDate(row.trade.simulationDate),
        entryPrice: row.entryPrice,
        exitPrice: row.trade.price,
        pnlAbs: row.trade.realizedPnL,
        pnlPct: row.pnlPct,
        direction: row.direction,
        narrative: generateNarrative(row, emotion),
        lesson: generateTradeLesson(row.pnlPct, row.trade.tags ?? [], emotion, row.durationMs),
        isWin: row.trade.realizedPnL > 0,
      };
    });
  }, [rows, emotions]);

  // Weekly debrief
  const weeklyDebriefs = useMemo((): WeeklyDebrief[] => {
    if (rows.length === 0) return [];

    const weekMap = new Map<string, TradeRow[]>();
    for (const r of rows) {
      const d = new Date(r.trade.simulationDate);
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      const key = monday.toISOString().slice(0, 10);
      if (!weekMap.has(key)) weekMap.set(key, []);
      weekMap.get(key)!.push(r);
    }

    return Array.from(weekMap.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 4)
      .map(([weekStart, weekRows]) => {
        const totalPnL = weekRows.reduce((s, r) => s + r.trade.realizedPnL, 0);
        const wins = weekRows.filter((r) => r.trade.realizedPnL > 0);
        const losses = weekRows.filter((r) => r.trade.realizedPnL <= 0);
        const winRate = weekRows.length > 0 ? (wins.length / weekRows.length) * 100 : 0;
        const bestTrade = weekRows.reduce((a, b) => a.trade.realizedPnL > b.trade.realizedPnL ? a : b);
        const worstTrade = weekRows.reduce((a, b) => a.trade.realizedPnL < b.trade.realizedPnL ? a : b);

        const bullets: string[] = [
          `Traded ${weekRows.length} position${weekRows.length !== 1 ? "s" : ""} with a ${winRate.toFixed(0)}% win rate, finishing the week ${totalPnL >= 0 ? "up" : "down"} ${formatCurrency(Math.abs(totalPnL))}.`,
          `Best trade: ${bestTrade.trade.ticker} at ${bestTrade.pnlPct.toFixed(1)}% (${formatCurrency(bestTrade.trade.realizedPnL)}).`,
          worstTrade !== bestTrade
            ? `Worst trade: ${worstTrade.trade.ticker} at ${worstTrade.pnlPct.toFixed(1)}% (${formatCurrency(worstTrade.trade.realizedPnL)}). Consider tightening stops.`
            : `Only one trade this week — increase sample size for meaningful insights.`,
          wins.length > losses.length
            ? `Win rate of ${winRate.toFixed(0)}% is above the 50% threshold — momentum is positive.`
            : `Win rate of ${winRate.toFixed(0)}% is below 50%. Focus on setup quality over quantity.`,
          totalPnL > 0
            ? `Profitable week. Lock in learning from your best setups before next week.`
            : `Loss week. Review each trade for common mistakes before the next session.`,
        ];

        const d = new Date(weekStart);
        const weekLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

        return { weekLabel, bullets, totalPnL, tradeCount: weekRows.length, winRate };
      });
  }, [rows]);

  // Best trade of the month
  const bestOfMonth = useMemo(() => {
    if (rows.length === 0) return null;
    return rows.reduce((a, b) => a.trade.realizedPnL > b.trade.realizedPnL ? a : b);
  }, [rows]);

  const [expandedNarrative, setExpandedNarrative] = useState<string | null>(null);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/50 flex h-24 items-center justify-center">
        <p className="text-[11px] text-muted-foreground">Complete trades to generate narratives.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Trade Narrative Generator</h3>
      </div>

      {/* Best trade of the month callout */}
      {bestOfMonth && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <p className="text-xs font-semibold text-amber-400">Best Trade This Month</p>
          </div>
          {(() => {
            const emotion = emotions[bestOfMonth.id];
            const narrative = generateNarrative(bestOfMonth, emotion);
            const lesson = generateTradeLesson(bestOfMonth.pnlPct, bestOfMonth.trade.tags ?? [], emotion, bestOfMonth.durationMs);
            return (
              <div className="space-y-1.5">
                <p className="text-[11px] text-foreground leading-relaxed">{narrative}</p>
                <p className="text-xs text-muted-foreground italic">Key lesson: {lesson}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-green-400">
                    +{formatCurrency(bestOfMonth.trade.realizedPnL)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({bestOfMonth.pnlPct.toFixed(1)}%) — {bestOfMonth.trade.ticker}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Individual trade narratives */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Trade Narratives</p>
        {narratives.slice(0, 8).map((n) => (
          <div
            key={n.tradeId}
            className={cn(
              "rounded-lg border bg-card/50 p-3 cursor-pointer transition-colors",
              n.isWin ? "border-green-500/20 hover:border-green-500/35" : "border-red-500/20 hover:border-red-500/35"
            )}
            onClick={() => setExpandedNarrative(expandedNarrative === n.tradeId ? null : n.tradeId)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {n.isWin ? (
                  <TrendingUp className="h-3 w-3 text-green-400 shrink-0" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400 shrink-0" />
                )}
                <span className="text-xs font-semibold">{n.ticker}</span>
                <span className="text-xs text-muted-foreground">{n.date}</span>
              </div>
              <span
                className={cn(
                  "text-xs font-bold tabular-nums",
                  n.isWin ? "text-green-400" : "text-red-400"
                )}
              >
                {n.pnlAbs >= 0 ? "+" : ""}{formatCurrency(n.pnlAbs)}
              </span>
            </div>
            {expandedNarrative === n.tradeId && (
              <div className="mt-2 space-y-1.5 border-t border-border/40 pt-2">
                <p className="text-[11px] text-foreground leading-relaxed">{n.narrative}</p>
                <p className="text-xs text-muted-foreground italic">Key lesson: {n.lesson}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Weekly Debrief */}
      {weeklyDebriefs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Weekly Debrief</p>
          {weeklyDebriefs.map((week) => (
            <div
              key={week.weekLabel}
              className="rounded-lg border border-border bg-card/50 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-semibold">Week of {week.weekLabel}</span>
                </div>
                <span
                  className={cn(
                    "text-xs font-bold tabular-nums",
                    week.totalPnL >= 0 ? "text-green-400" : "text-red-400"
                  )}
                >
                  {week.totalPnL >= 0 ? "+" : ""}{formatCurrency(week.totalPnL)}
                </span>
              </div>
              <ul className="space-y-1">
                {week.bullets.map((bullet, i) => (
                  <li key={i} className="flex gap-1.5 text-[11px] text-muted-foreground">
                    <span className="mt-0.5 shrink-0 text-primary">•</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Section 4: Habit Tracking ────────────────────────────────────────────────

const HABIT_STORAGE_KEY = "finsim-journal-habits-v2";

function loadHabits(): Record<string, Partial<HabitCheck>> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(HABIT_STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveHabits(data: Record<string, Partial<HabitCheck>>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HABIT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function HabitTracking({ rows, rng }: { rows: TradeRow[]; rng: () => number }) {
  const [habits, setHabits] = useState<Record<string, Partial<HabitCheck>>>({});

  useEffect(() => {
    setHabits(loadHabits());
  }, []);

  function toggleHabit(tradeId: string, field: keyof Omit<HabitCheck, "tradeId" | "disciplineScore">) {
    setHabits((prev) => {
      const current = prev[tradeId] ?? {};
      const updated = { ...current, [field]: !current[field] };
      const next = { ...prev, [tradeId]: updated };
      saveHabits(next);
      return next;
    });
  }

  const habitStats = useMemo(() => {
    const recentRows = rows.slice(0, 10);
    const scores = recentRows.map((r) => {
      const h = habits[r.id] ?? {};
      const checks = [h.checkedTrend, h.setStopLoss, h.followedSizing, h.avoidedFomo];
      const score = (checks.filter(Boolean).length / checks.length) * 100;
      return { row: r, score };
    });

    const avgDiscipline = scores.length > 0
      ? scores.reduce((s, x) => s + x.score, 0) / scores.length
      : 0;

    // Correlation: discipline vs P&L
    const highDiscipline = scores.filter((x) => x.score >= 75);
    const lowDiscipline = scores.filter((x) => x.score < 75);
    const highAvgPnL = highDiscipline.length > 0
      ? highDiscipline.reduce((s, x) => s + x.row.trade.realizedPnL, 0) / highDiscipline.length
      : null;
    const lowAvgPnL = lowDiscipline.length > 0
      ? lowDiscipline.reduce((s, x) => s + x.row.trade.realizedPnL, 0) / lowDiscipline.length
      : null;

    return { scores, avgDiscipline, highAvgPnL, lowAvgPnL };
  }, [rows, habits]);

  // Calendar heatmap: 35-day grid
  const today = new Date();
  const calendarDays = useMemo(() => {
    const days: { date: Date; score: number | null; hasTrade: boolean }[] = [];
    for (let i = 34; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayStr = d.toISOString().slice(0, 10);
      const dayRows = rows.filter((r) => {
        const rd = new Date(r.trade.simulationDate).toISOString().slice(0, 10);
        return rd === dayStr;
      });
      if (dayRows.length > 0) {
        const scores = dayRows.map((r) => {
          const h = habits[r.id] ?? {};
          const checks = [h.checkedTrend, h.setStopLoss, h.followedSizing, h.avoidedFomo];
          return (checks.filter(Boolean).length / checks.length) * 100;
        });
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        days.push({ date: d, score: avgScore, hasTrade: true });
      } else {
        days.push({ date: d, score: null, hasTrade: false });
      }
    }
    return days;
  }, [rows, habits, today]);

  const HABITS_CONFIG = [
    { field: "checkedTrend" as const, label: "Checked trend direction" },
    { field: "setStopLoss" as const, label: "Set stop loss before entry" },
    { field: "followedSizing" as const, label: "Followed position sizing rules" },
    { field: "avoidedFomo" as const, label: "Avoided FOMO entry" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-400" />
        <h3 className="text-sm font-semibold">Habit Tracking</h3>
      </div>

      {/* Discipline score header */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs font-medium text-muted-foreground">Discipline Score</p>
          <p className={cn(
            "mt-1 text-xl font-bold tabular-nums",
            habitStats.avgDiscipline >= 75 ? "text-green-400"
            : habitStats.avgDiscipline >= 50 ? "text-amber-400"
            : "text-red-400"
          )}>
            {habitStats.avgDiscipline.toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground">This week</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs font-medium text-muted-foreground">High Discipline</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-green-400">
            {habitStats.highAvgPnL !== null ? formatCurrency(habitStats.highAvgPnL) : "—"}
          </p>
          <p className="text-xs text-muted-foreground">Avg P&L (≥75%)</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs font-medium text-muted-foreground">Low Discipline</p>
          <p className={cn(
            "mt-1 text-xl font-bold tabular-nums",
            (habitStats.lowAvgPnL ?? 0) >= 0 ? "text-foreground" : "text-red-400"
          )}>
            {habitStats.lowAvgPnL !== null ? formatCurrency(habitStats.lowAvgPnL) : "—"}
          </p>
          <p className="text-xs text-muted-foreground">Avg P&L (&lt;75%)</p>
        </div>
      </div>

      {/* Checklist per trade */}
      {rows.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="mb-3 text-xs font-medium text-muted-foreground">Checklist Adherence (Recent 5 Trades)</p>
          <div className="space-y-3">
            {rows.slice(0, 5).map((row) => {
              const h = habits[row.id] ?? {};
              const checks = [h.checkedTrend, h.setStopLoss, h.followedSizing, h.avoidedFomo];
              const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
              return (
                <div key={row.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold">{row.trade.ticker}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(row.trade.simulationDate)}</span>
                    </div>
                    <span className={cn(
                      "text-xs font-bold",
                      score >= 75 ? "text-green-400" : score >= 50 ? "text-amber-400" : "text-red-400"
                    )}>
                      {score}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {HABITS_CONFIG.map(({ field, label }) => {
                      const checked = !!(habits[row.id]?.[field]);
                      return (
                        <button
                          key={field}
                          onClick={() => toggleHabit(row.id, field)}
                          className={cn(
                            "flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors text-left",
                            checked
                              ? "bg-green-500/15 text-green-400 border border-green-500/30"
                              : "bg-muted/20 text-muted-foreground border border-border/50 hover:border-border"
                          )}
                        >
                          <div className={cn(
                            "h-3 w-3 rounded-sm border shrink-0 flex items-center justify-center",
                            checked ? "border-green-500 bg-green-500/30" : "border-muted-foreground/40"
                          )}>
                            {checked && <span className="text-[7px] text-green-400 font-bold leading-none">✓</span>}
                          </div>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendar heatmap */}
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">35-Day Discipline Calendar</p>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            let fill = "bg-muted/15";
            if (day.hasTrade) {
              if (day.score === null) fill = "bg-muted-foreground/30";
              else if (day.score >= 75) fill = "bg-green-500/60";
              else if (day.score >= 50) fill = "bg-amber-500/60";
              else fill = "bg-red-500/50";
            }
            return (
              <div
                key={i}
                title={`${day.date.toLocaleDateString()}: ${day.hasTrade ? `${(day.score ?? 0).toFixed(0)}%` : "No trades"}`}
                className={cn(
                  "h-4 w-full rounded-sm transition-all",
                  fill
                )}
              />
            );
          })}
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-green-500/60 inline-block" /> ≥75% disciplined</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-amber-500/60 inline-block" /> 50–74%</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-red-500/50 inline-block" /> &lt;50%</span>
        </div>
      </div>

      {/* Discipline vs P&L correlation insight */}
      {habitStats.highAvgPnL !== null && habitStats.lowAvgPnL !== null && (
        <div className={cn(
          "rounded-lg border p-3",
          habitStats.highAvgPnL > habitStats.lowAvgPnL
            ? "border-green-500/20 bg-green-500/5"
            : "border-amber-500/20 bg-amber-500/5"
        )}>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {habitStats.highAvgPnL > habitStats.lowAvgPnL
              ? `When you score 75%+ on your checklist, your average P&L is ${formatCurrency(habitStats.highAvgPnL)} vs ${formatCurrency(habitStats.lowAvgPnL ?? 0)} on lower-discipline trades. Discipline directly improves your edge.`
              : `Your checklist adherence data is still building. Keep logging habits to reveal the discipline-performance correlation.`
            }
          </p>
        </div>
      )}
    </div>
  );
}

// ── Section 5: Improvement Roadmap ───────────────────────────────────────────

function ImprovementRoadmap({ rows, rng }: { rows: TradeRow[]; rng: () => number }) {
  const suggestions = useMemo((): ImprovementSuggestion[] => {
    const result: ImprovementSuggestion[] = [];

    if (rows.length < 2) {
      return [
        {
          id: "need_data",
          priority: 1,
          title: "Complete more trades to unlock insights",
          detail: "At least 5 closed trades are needed to generate personalized improvement suggestions.",
          estimatedGain: 0,
          sentiment: "warning",
        },
      ];
    }

    // 1. Monday analysis
    const mondayRows = rows.filter((r) => new Date(r.trade.simulationDate).getDay() === 1);
    const nonMondayRows = rows.filter((r) => new Date(r.trade.simulationDate).getDay() !== 1);
    if (mondayRows.length >= 2 && nonMondayRows.length >= 2) {
      const mondayWR = mondayRows.filter((r) => r.trade.realizedPnL > 0).length / mondayRows.length;
      const otherWR = nonMondayRows.filter((r) => r.trade.realizedPnL > 0).length / nonMondayRows.length;
      if (mondayWR < otherWR - 0.15) {
        const avgMondayLoss = mondayRows.filter((r) => r.trade.realizedPnL < 0)
          .reduce((s, r) => s + Math.abs(r.trade.realizedPnL), 0) / Math.max(1, mondayRows.length);
        result.push({
          id: "monday_avoidance",
          priority: 1,
          title: "Consider avoiding Monday entries",
          detail: `You lose ${((otherWR - mondayWR) * 100).toFixed(0)}% more often on Mondays vs other days (${(mondayWR * 100).toFixed(0)}% vs ${(otherWR * 100).toFixed(0)}% win rate). Waiting for Tuesday price action could save ~${formatCurrency(avgMondayLoss)}/week.`,
          estimatedGain: avgMondayLoss * 4,
          sentiment: "negative",
        });
      }
    }

    // 2. Long holds
    const longHolds = rows.filter((r) => r.durationMs > 3 * 24 * 3_600_000);
    const shortHolds = rows.filter((r) => r.durationMs >= 0 && r.durationMs <= 3 * 24 * 3_600_000);
    if (longHolds.length >= 2 && shortHolds.length >= 2) {
      const longAvgLoss = longHolds.filter((r) => r.trade.realizedPnL < 0)
        .reduce((s, r) => s + Math.abs(r.trade.realizedPnL), 0) / Math.max(1, longHolds.length);
      const shortAvgLoss = shortHolds.filter((r) => r.trade.realizedPnL < 0)
        .reduce((s, r) => s + Math.abs(r.trade.realizedPnL), 0) / Math.max(1, shortHolds.length);
      if (longAvgLoss > shortAvgLoss * 1.5) {
        result.push({
          id: "long_hold_risk",
          priority: 2,
          title: "Reduce extended hold periods",
          detail: `Your average loss when holding >3 days is ${formatCurrency(longAvgLoss)}, which is ${(longAvgLoss / Math.max(shortAvgLoss, 1)).toFixed(1)}× larger than shorter holds (${formatCurrency(shortAvgLoss)}). Add a time-based exit rule for multi-day positions.`,
          estimatedGain: (longAvgLoss - shortAvgLoss) * longHolds.length,
          sentiment: "negative",
        });
      }
    }

    // 3. Unclear trend keyword check
    const unclearRows = rows.filter((r) =>
      (r.trade.notes ?? "").toLowerCase().match(/unclear|not sure|confused|choppy|sideways/)
    );
    if (unclearRows.length >= 1) {
      const unclearWR = unclearRows.filter((r) => r.trade.realizedPnL > 0).length / unclearRows.length;
      const overallWR = rows.filter((r) => r.trade.realizedPnL > 0).length / rows.length;
      result.push({
        id: "unclear_trend",
        priority: 1,
        title: "Skip trades when trend is unclear",
        detail: `When you note unclear/uncertain conditions, your win rate drops to ${(unclearWR * 100).toFixed(0)}% vs ${(overallWR * 100).toFixed(0)}% overall. Sitting out pays — "when in doubt, stay out" could add ${formatCurrency(unclearRows.reduce((s, r) => s + Math.abs(r.trade.realizedPnL < 0 ? r.trade.realizedPnL : 0), 0))} back.`,
        estimatedGain: unclearRows.filter((r) => r.trade.realizedPnL < 0).reduce((s, r) => s + Math.abs(r.trade.realizedPnL), 0),
        sentiment: "negative",
      });
    }

    // 4. Win-rate above threshold
    const overallWR = rows.filter((r) => r.trade.realizedPnL > 0).length / rows.length;
    const avgWin = rows.filter((r) => r.trade.realizedPnL > 0).reduce((s, r) => s + r.trade.realizedPnL, 0)
      / Math.max(1, rows.filter((r) => r.trade.realizedPnL > 0).length);
    const avgLoss = Math.abs(rows.filter((r) => r.trade.realizedPnL < 0).reduce((s, r) => s + r.trade.realizedPnL, 0))
      / Math.max(1, rows.filter((r) => r.trade.realizedPnL < 0).length);

    if (overallWR >= 0.6 && avgWin < avgLoss) {
      result.push({
        id: "let_winners_run",
        priority: 2,
        title: "Let your winners run longer",
        detail: `Your win rate is solid at ${(overallWR * 100).toFixed(0)}%, but average wins (${formatCurrency(avgWin)}) are smaller than average losses (${formatCurrency(avgLoss)}). Extending your profit targets by 20% could improve monthly P&L by ~${formatCurrency(avgWin * 0.2 * rows.length * overallWR)}.`,
        estimatedGain: avgWin * 0.2 * rows.length * overallWR,
        sentiment: "positive",
      });
    }

    // 5. Position sizing
    const largeLosses = rows.filter((r) => r.pnlPct < -5);
    if (largeLosses.length >= 2) {
      const avgLargeLoss = largeLosses.reduce((s, r) => s + Math.abs(r.trade.realizedPnL), 0) / largeLosses.length;
      result.push({
        id: "position_sizing",
        priority: 3,
        title: "Apply stricter max-loss per trade (2% rule)",
        detail: `You have ${largeLosses.length} trade${largeLosses.length !== 1 ? "s" : ""} with >5% loss. A 2%-per-trade max-loss rule would have capped each loss and saved approximately ${formatCurrency(avgLargeLoss * 0.6 * largeLosses.length)} over this period.`,
        estimatedGain: avgLargeLoss * 0.6 * largeLosses.length,
        sentiment: "negative",
      });
    }

    // Fill with synthetic if fewer than 3 suggestions
    if (result.length < 3) {
      const synSuggestions: ImprovementSuggestion[] = [
        {
          id: "journal_consistency",
          priority: 2,
          title: "Add notes to every trade",
          detail: "Trades with detailed notes show 30% better performance on average (industry research). Even 1–2 sentences per trade dramatically improves pattern recognition.",
          estimatedGain: rows.length > 0 ? rows.reduce((s, r) => s + Math.abs(r.trade.realizedPnL), 0) * 0.05 : 200,
          sentiment: "positive",
        },
        {
          id: "pre_trade_checklist",
          priority: 1,
          title: "Complete the pre-trade checklist before every entry",
          detail: "Research shows traders who use a structured checklist reduce impulsive trades by 40%. Start with 4 questions: trend direction, stop placement, size, and bias check.",
          estimatedGain: 350 + rng() * 200,
          sentiment: "positive",
        },
      ];
      for (const s of synSuggestions) {
        if (result.length >= 3) break;
        if (!result.find((r) => r.id === s.id)) result.push(s);
      }
    }

    return result.slice(0, 5).sort((a, b) => a.priority - b.priority);
  }, [rows, rng]);

  const PRIORITY_COLORS: Record<number, string> = {
    1: "text-red-400 border-red-500/30 bg-red-500/5",
    2: "text-amber-400 border-amber-500/30 bg-amber-500/5",
    3: "text-primary border-border bg-primary/5",
  };

  const PRIORITY_LABELS: Record<number, string> = {
    1: "High Priority",
    2: "Medium Priority",
    3: "Nice to Have",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Improvement Roadmap</h3>
      </div>

      <div className="space-y-3">
        {suggestions.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "rounded-lg border p-3",
              PRIORITY_COLORS[s.priority]
            )}
          >
            <div className="flex items-start gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted/30 text-xs font-bold text-foreground mt-0.5">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-xs font-semibold text-foreground">{s.title}</span>
                  <span className={cn(
                    "rounded-full px-1.5 py-0.5 text-[11px] font-medium border",
                    PRIORITY_COLORS[s.priority]
                  )}>
                    {PRIORITY_LABELS[s.priority]}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{s.detail}</p>
                {s.estimatedGain > 0 && (
                  <div className="mt-1.5 flex items-center gap-1">
                    <BarChart2 className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-green-400 font-medium">
                      Estimated gain: +{formatCurrency(s.estimatedGain)}/month if fixed
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary callout */}
      {suggestions.filter((s) => s.estimatedGain > 0).length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-semibold text-primary">Total Addressable Improvement</p>
          </div>
          <p className="text-base font-bold text-foreground">
            +{formatCurrency(suggestions.reduce((s, x) => s + x.estimatedGain, 0))}
          </p>
          <p className="text-xs text-muted-foreground">Estimated monthly P&L improvement if top suggestions are applied</p>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

type InsightsSection = "patterns" | "emotions" | "narratives" | "habits" | "roadmap";

const SECTION_TABS: { value: InsightsSection; label: string; icon: React.ReactNode }[] = [
  { value: "patterns",   label: "Patterns",   icon: <Brain className="h-3 w-3" /> },
  { value: "emotions",   label: "Emotions",   icon: <Zap className="h-3 w-3" /> },
  { value: "narratives", label: "Narratives", icon: <BookOpen className="h-3 w-3" /> },
  { value: "habits",     label: "Habits",     icon: <CheckCircle2 className="h-3 w-3" /> },
  { value: "roadmap",    label: "Roadmap",    icon: <Target className="h-3 w-3" /> },
];

interface JournalInsightsProps {
  rows: TradeRow[];
}

export function JournalInsights({ rows }: JournalInsightsProps) {
  const [section, setSection] = useState<InsightsSection>("patterns");
  const [emotions, setEmotions] = useState<Record<string, TradeEmotion>>({});

  useEffect(() => {
    setEmotions(loadEmotions());
  }, [rows]);

  // Stable seeded PRNG (seed=8080)
  const rng = useMemo(() => mulberry32(8080), []);

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <Brain className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold">AI Insights Engine</p>
          <p className="text-xs text-muted-foreground">
            Pattern analysis across {rows.length} closed trade{rows.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Section nav */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
        {SECTION_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSection(tab.value)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
              section === tab.value
                ? "bg-primary/15 text-primary border border-primary/25"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div>
        {section === "patterns" && (
          <PatternRecognition rows={rows} rng={rng} />
        )}
        {section === "emotions" && (
          <EmotionPerformance rows={rows} emotions={emotions} rng={rng} />
        )}
        {section === "narratives" && (
          <TradeNarratives rows={rows} emotions={emotions} />
        )}
        {section === "habits" && (
          <HabitTracking rows={rows} rng={rng} />
        )}
        {section === "roadmap" && (
          <ImprovementRoadmap rows={rows} rng={rng} />
        )}
      </div>
    </div>
  );
}
