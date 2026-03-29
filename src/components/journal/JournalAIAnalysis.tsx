"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  BarChart2,
  Sparkles,
  Download,
  FileText,
  Flame,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { TradeRow } from "@/app/(dashboard)/journal/JournalPageClient";
import { formatDuration } from "@/app/(dashboard)/journal/JournalPageClient";
import { loadTradeTags } from "./TradeLogTable";

// ── Constants ────────────────────────────────────────────────────────────────

const EMOTIONS_STORAGE_KEY = "finsim-trade-emotions-v1";
const STREAK_STORAGE_KEY = "finsim-journal-streak-v1";

export type TradeEmotion = "anxious" | "neutral" | "confident" | "greedy" | "frustrated";

const EMOTION_CONFIG: Record<
  TradeEmotion,
  { emoji: string; label: string; color: string; bgColor: string }
> = {
  anxious:    { emoji: "😰", label: "Anxious",    color: "text-primary",   bgColor: "bg-primary/15 border-border" },
  neutral:    { emoji: "😐", label: "Neutral",    color: "text-muted-foreground",  bgColor: "bg-muted-foreground/15 border-muted-foreground/30" },
  confident:  { emoji: "😊", label: "Confident",  color: "text-green-400",  bgColor: "bg-green-500/15 border-green-500/30" },
  greedy:     { emoji: "🤑", label: "Greedy",     color: "text-amber-400",  bgColor: "bg-amber-500/15 border-amber-500/30" },
  frustrated: { emoji: "😤", label: "Frustrated", color: "text-red-400",    bgColor: "bg-red-500/15 border-red-500/30" },
};

const EMOTION_ORDER: TradeEmotion[] = ["anxious", "neutral", "confident", "greedy", "frustrated"];

// ── localStorage helpers ─────────────────────────────────────────────────────

export function loadEmotions(): Record<string, TradeEmotion> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(EMOTIONS_STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveEmotions(data: Record<string, TradeEmotion>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EMOTIONS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

interface StreakData {
  lastActiveDate: string; // ISO date string YYYY-MM-DD
  currentStreak: number;
  history: string[]; // array of YYYY-MM-DD strings (last 30 days)
}

function loadStreak(): StreakData {
  if (typeof window === "undefined") {
    return { lastActiveDate: "", currentStreak: 0, history: [] };
  }
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) return { lastActiveDate: "", currentStreak: 0, history: [] };
    return JSON.parse(raw) as StreakData;
  } catch {
    return { lastActiveDate: "", currentStreak: 0, history: [] };
  }
}

function saveStreak(data: StreakData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function markActiveToday(current: StreakData): StreakData {
  const today = todayISO();
  if (current.lastActiveDate === today) return current;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = yesterday.toISOString().slice(0, 10);

  const newStreak =
    current.lastActiveDate === yesterdayISO ? current.currentStreak + 1 : 1;

  // Keep last 30 days of history
  const history = [...current.history, today].filter((d) => {
    const diff =
      (new Date(today).getTime() - new Date(d).getTime()) /
      (1000 * 60 * 60 * 24);
    return diff <= 30;
  });

  return { lastActiveDate: today, currentStreak: newStreak, history };
}

// ── Narrative generator ───────────────────────────────────────────────────────

function generateNarrative(row: TradeRow, tags: string[]): string {
  const { trade, direction, pnlPct, durationMs, entryPrice } = row;
  const ticker = trade.ticker;
  const exitPrice = trade.price;
  const pnlSign = trade.realizedPnL >= 0 ? "+" : "";
  const pnlStr = `${pnlSign}${pnlPct.toFixed(1)}%`;
  const durationStr = durationMs >= 0 ? formatDuration(durationMs) : "unknown duration";

  // Determine entry context
  const entryTag = tags.includes("Breakout")
    ? "as price broke out of consolidation"
    : tags.includes("Reversal")
    ? "at a reversal signal near key support"
    : tags.includes("News Play")
    ? "ahead of a catalyst event"
    : direction === "long"
    ? "as RSI showed oversold conditions near support"
    : "as RSI showed overbought conditions near resistance";

  // Determine exit context
  const exitContext =
    trade.realizedPnL > 0
      ? tags.includes("FOMO")
        ? "after momentum faded"
        : "when price reached resistance and MACD turned bearish"
      : tags.includes("Revenge Trade")
      ? "after failing to recover — a reminder to respect the stop"
      : "after price reversed through the stop-loss level";

  const dirLabel = direction === "long" ? "long" : "short";
  const sentence1 = `Entered ${ticker} ${dirLabel} at ${formatCurrency(entryPrice)} ${entryTag}.`;
  const sentence2 = `Exited at ${formatCurrency(exitPrice)} after ${durationStr} for ${pnlStr} ${exitContext}.`;

  return `${sentence1} ${sentence2}`;
}

// ── AI Analysis computation ───────────────────────────────────────────────────

function computeAIAnalysis(
  rows: TradeRow[],
  tradeTags: Record<string, string[]>,
  emotions: Record<string, TradeEmotion>,
) {
  if (rows.length === 0) return null;

  const wins = rows.filter((r) => r.trade.realizedPnL > 0);
  const losses = rows.filter((r) => r.trade.realizedPnL < 0);

  // ── Pattern analysis: tag win rates ─────────────────────────────────────────
  const tagWinRates: { tag: string; winRate: number; count: number }[] = [];
  const allTags = new Set<string>();
  for (const tags of Object.values(tradeTags)) {
    for (const t of tags) allTags.add(t);
  }
  for (const tag of allTags) {
    const tagged = rows.filter((r) =>
      (tradeTags[r.id] ?? r.trade.tags ?? []).includes(tag),
    );
    if (tagged.length >= 2) {
      tagWinRates.push({
        tag,
        winRate:
          (tagged.filter((r) => r.trade.realizedPnL > 0).length / tagged.length) *
          100,
        count: tagged.length,
      });
    }
  }
  tagWinRates.sort((a, b) => b.winRate - a.winRate);

  // ── Behavioral analysis: day-of-week win rates ────────────────────────────
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dowStats = new Map<number, { wins: number; total: number }>();
  for (const r of rows) {
    const dow = new Date(r.trade.simulationDate).getDay();
    if (!dowStats.has(dow)) dowStats.set(dow, { wins: 0, total: 0 });
    const s = dowStats.get(dow)!;
    s.total++;
    if (r.trade.realizedPnL > 0) s.wins++;
  }
  const dowWinRates = Array.from(dowStats.entries())
    .filter(([, s]) => s.total >= 2)
    .map(([dow, s]) => ({ dow, label: DOW[dow], winRate: (s.wins / s.total) * 100, total: s.total }))
    .sort((a, b) => b.winRate - a.winRate);

  // ── Size analysis: avg winner vs avg loser ────────────────────────────────
  const avgWin = wins.length
    ? wins.reduce((s, r) => s + r.trade.realizedPnL, 0) / wins.length
    : 0;
  const avgLoss = losses.length
    ? Math.abs(losses.reduce((s, r) => s + r.trade.realizedPnL, 0) / losses.length)
    : 0;
  const sizeRatio = avgLoss > 0 ? avgWin / avgLoss : null;

  // ── Time analysis: best/worst holding periods ─────────────────────────────
  const validRows = rows.filter((r) => r.durationMs >= 0);
  let bestHoldingPeriod: string | null = null;
  let worstHoldingPeriod: string | null = null;

  if (validRows.length >= 4) {
    const buckets = [
      { label: "< 1h",   filter: (ms: number) => ms < 3_600_000 },
      { label: "1–4h",  filter: (ms: number) => ms >= 3_600_000 && ms < 14_400_000 },
      { label: "4–24h", filter: (ms: number) => ms >= 14_400_000 && ms < 86_400_000 },
      { label: "> 1d",  filter: (ms: number) => ms >= 86_400_000 },
    ];
    const bucketStats = buckets
      .map((b) => {
        const bRows = validRows.filter((r) => b.filter(r.durationMs));
        if (bRows.length < 2) return null;
        const bWins = bRows.filter((r) => r.trade.realizedPnL > 0).length;
        return { label: b.label, winRate: (bWins / bRows.length) * 100, count: bRows.length };
      })
      .filter(Boolean) as { label: string; winRate: number; count: number }[];

    if (bucketStats.length >= 2) {
      bucketStats.sort((a, b) => b.winRate - a.winRate);
      bestHoldingPeriod = bucketStats[0].label;
      worstHoldingPeriod = bucketStats[bucketStats.length - 1].label;
    }
  }

  // ── Emotion win rates ─────────────────────────────────────────────────────
  const emotionStats: Record<TradeEmotion, { wins: number; total: number }> = {
    anxious:    { wins: 0, total: 0 },
    neutral:    { wins: 0, total: 0 },
    confident:  { wins: 0, total: 0 },
    greedy:     { wins: 0, total: 0 },
    frustrated: { wins: 0, total: 0 },
  };
  for (const r of rows) {
    const emotion = emotions[r.id];
    if (emotion) {
      emotionStats[emotion].total++;
      if (r.trade.realizedPnL > 0) emotionStats[emotion].wins++;
    }
  }

  // ── Monthly emotion distribution ──────────────────────────────────────────
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyEmotionCounts: Record<TradeEmotion, number> = {
    anxious: 0,
    neutral: 0,
    confident: 0,
    greedy: 0,
    frustrated: 0,
  };
  for (const r of rows) {
    const emotion = emotions[r.id];
    if (!emotion) continue;
    const d = new Date(r.trade.simulationDate);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      monthlyEmotionCounts[emotion]++;
    }
  }

  return {
    tagWinRates,
    dowWinRates,
    sizeRatio,
    avgWin,
    avgLoss,
    bestHoldingPeriod,
    worstHoldingPeriod,
    emotionStats,
    monthlyEmotionCounts,
  };
}

// ── EmotionPicker (used in expanded trade rows) ───────────────────────────────

export function EmotionPicker({
  tradeId,
  currentEmotion,
  onSelect,
}: {
  tradeId: string;
  currentEmotion?: TradeEmotion;
  onSelect: (tradeId: string, emotion: TradeEmotion) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">
        How did you feel?
      </label>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {EMOTION_ORDER.map((e) => {
          const cfg = EMOTION_CONFIG[e];
          const active = currentEmotion === e;
          return (
            <button
              key={e}
              onClick={(ev) => {
                ev.stopPropagation();
                onSelect(tradeId, e);
              }}
              className={cn(
                "flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium transition-colors",
                active
                  ? cfg.bgColor + " " + cfg.color
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <span>{cfg.emoji}</span>
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── NarrativeButton ──────────────────────────────────────────────────────────

export function NarrativeButton({
  row,
  tags,
}: {
  row: TradeRow;
  tags: string[];
}) {
  const [narrative, setNarrative] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const text = generateNarrative(row, tags);
      setNarrative(text);
      setGenerated(true);
    },
    [row, tags],
  );

  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">
        AI Narrative
      </label>
      <div className="mt-1.5">
        {narrative ? (
          <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-[11px] leading-relaxed text-foreground/80">
            {narrative}
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            className={cn(
              "flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[11px] font-medium transition-colors",
              generated
                ? "border-primary/40 bg-primary/8 text-primary"
                : "text-muted-foreground hover:border-primary/30 hover:text-foreground",
            )}
          >
            <Sparkles className="h-3 w-3" />
            Generate Narrative
          </button>
        )}
        {narrative && (
          <button
            onClick={handleGenerate}
            className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
          >
            <Sparkles className="h-2.5 w-2.5" /> Regenerate
          </button>
        )}
      </div>
    </div>
  );
}

// ── EmotionDonut (SVG donut) ─────────────────────────────────────────────────

function EmotionDonut({
  counts,
}: {
  counts: Record<TradeEmotion, number>;
}) {
  const total = EMOTION_ORDER.reduce((s, e) => s + counts[e], 0);
  if (total === 0) return null;

  const r = 34;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;
  const COLORS: Record<TradeEmotion, string> = {
    anxious: "#60a5fa",
    neutral: "#94a3b8",
    confident: "#4ade80",
    greedy: "#fbbf24",
    frustrated: "#f87171",
  };

  let offset = 0;
  const slices: { emotion: TradeEmotion; dashArray: string; dashOffset: number; pct: number }[] = [];
  for (const e of EMOTION_ORDER) {
    const pct = counts[e] / total;
    const arcLen = pct * circumference;
    slices.push({ emotion: e, dashArray: `${arcLen} ${circumference - arcLen}`, dashOffset: -offset, pct });
    offset += arcLen;
  }

  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0 -rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={12} />
      {slices
        .filter((s) => s.pct > 0)
        .map((s) => (
          <circle
            key={s.emotion}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={COLORS[s.emotion]}
            strokeWidth={12}
            strokeDasharray={s.dashArray}
            strokeDashoffset={s.dashOffset}
            strokeLinecap="butt"
          />
        ))}
    </svg>
  );
}

// ── EmotionWinRateBar ─────────────────────────────────────────────────────────

function EmotionWinRateBar({
  emotionStats,
}: {
  emotionStats: Record<TradeEmotion, { wins: number; total: number }>;
}) {
  const entries = EMOTION_ORDER.filter((e) => emotionStats[e].total > 0);
  if (entries.length === 0) return null;

  return (
    <div className="space-y-2">
      {entries.map((e) => {
        const cfg = EMOTION_CONFIG[e];
        const { wins, total } = emotionStats[e];
        const wr = total > 0 ? (wins / total) * 100 : 0;
        return (
          <div key={e} className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground">
              {cfg.emoji} {cfg.label}
            </span>
            <div className="flex h-4 flex-1 overflow-hidden rounded-sm bg-muted/20">
              <div
                className={cn("h-full transition-all", wr >= 50 ? "bg-green-500/60" : "bg-red-500/50")}
                style={{ width: `${wr}%` }}
              />
            </div>
            <span className={cn("w-10 shrink-0 text-right text-xs tabular-nums font-medium", wr >= 50 ? "text-green-400" : "text-red-400")}>
              {wr.toFixed(0)}%
            </span>
            <span className="w-12 shrink-0 text-right text-[11px] text-muted-foreground/60">
              {wins}/{total}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Streak Heatmap ────────────────────────────────────────────────────────────

function StreakHeatmap({ history }: { history: string[] }) {
  const historySet = new Set(history);
  const today = new Date();
  const days: { date: string; label: string; active: boolean; isToday: boolean }[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const dayNum = d.getDate();
    days.push({
      date: iso,
      label: String(dayNum),
      active: historySet.has(iso),
      isToday: i === 0,
    });
  }

  return (
    <div className="flex flex-wrap gap-1">
      {days.map((d) => (
        <div
          key={d.date}
          title={d.date}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-sm text-[8px] font-medium transition-colors",
            d.active
              ? "bg-primary/70 text-primary-foreground"
              : "bg-muted/30 text-muted-foreground/40",
            d.isToday && !d.active && "ring-1 ring-primary/40",
          )}
        >
          {d.label}
        </div>
      ))}
    </div>
  );
}

// ── CSV Export ────────────────────────────────────────────────────────────────

function exportCSV(
  rows: TradeRow[],
  tradeTags: Record<string, string[]>,
  emotions: Record<string, TradeEmotion>,
  notes: Record<string, string>,
) {
  const headers = [
    "Date",
    "Ticker",
    "Direction",
    "Entry Price",
    "Exit Price",
    "Quantity",
    "P&L ($)",
    "P&L (%)",
    "Hold Duration",
    "Grade",
    "Tags",
    "Emotion",
    "Notes",
  ];

  const csvRows = rows.map((r) => {
    const date = new Date(r.trade.simulationDate).toLocaleDateString("en-US");
    const tags = (tradeTags[r.id] ?? r.trade.tags ?? []).join("; ");
    const emotion = emotions[r.id]
      ? EMOTION_CONFIG[emotions[r.id]].label
      : "";
    const note = (notes[r.id] ?? r.trade.notes ?? "").replace(/"/g, '""');
    return [
      date,
      r.trade.ticker,
      r.direction,
      r.entryPrice.toFixed(2),
      r.trade.price.toFixed(2),
      r.trade.quantity,
      r.trade.realizedPnL.toFixed(2),
      r.pnlPct.toFixed(2),
      r.durationMs >= 0 ? formatDuration(r.durationMs) : "",
      r.grade.grade,
      tags,
      emotion,
      `"${note}"`,
    ].join(",");
  });

  const csv = [headers.join(","), ...csvRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `finsim-journal-${todayISO()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Main JournalAIAnalysis Component ─────────────────────────────────────────

interface Props {
  rows: TradeRow[];
  notes?: Record<string, string>;
}

export function JournalAIAnalysis({ rows, notes = {} }: Props) {
  const [tradeTags, setTradeTags] = useState<Record<string, string[]>>({});
  const [emotions, setEmotions] = useState<Record<string, TradeEmotion>>({});
  const [streakData, setStreakData] = useState<StreakData>({
    lastActiveDate: "",
    currentStreak: 0,
    history: [],
  });

  useEffect(() => {
    setTradeTags(loadTradeTags());
    setEmotions(loadEmotions());
    // Update streak on mount
    const current = loadStreak();
    const updated = markActiveToday(current);
    saveStreak(updated);
    setStreakData(updated);
  }, []);

  const analysis = useMemo(
    () => computeAIAnalysis(rows, tradeTags, emotions),
    [rows, tradeTags, emotions],
  );

  if (rows.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/50 text-muted-foreground">
        <Brain className="h-5 w-5 opacity-30" />
        <p className="text-sm">No trades to analyze yet.</p>
      </div>
    );
  }

  const totalEmotionRecorded = Object.values(analysis?.monthlyEmotionCounts ?? {}).reduce(
    (s, v) => s + v,
    0,
  );

  return (
    <div className="space-y-4">

      {/* ── Streak section ───────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            Journaling Streak
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold tabular-nums text-orange-400">
              {streakData.currentStreak}
            </span>
            <span className="text-xs text-muted-foreground">days</span>
          </div>
        </div>
        <StreakHeatmap history={streakData.history} />
        <p className="mt-2 text-[11px] text-muted-foreground/50">
          Last 30 days — activity recorded when you visit the journal
        </p>
      </div>

      {/* ── Monthly Debrief ──────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold">
          <Brain className="h-3.5 w-3.5 text-primary" />
          Monthly Performance Debrief
        </div>
        <div className="space-y-3">
          {/* Pattern analysis */}
          {analysis && analysis.tagWinRates.length > 0 && (
            <DebriefCard
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              sentiment="positive"
              label="Pattern Analysis"
            >
              {analysis.tagWinRates.slice(0, 2).map((t) => (
                <p key={t.tag} className="text-[11px] text-muted-foreground">
                  You win{" "}
                  <span className={cn("font-semibold", t.winRate >= 50 ? "text-green-400" : "text-red-400")}>
                    {t.winRate.toFixed(0)}%
                  </span>{" "}
                  of trades tagged{" "}
                  <span className="font-medium text-foreground/80">&ldquo;{t.tag}&rdquo;</span>{" "}
                  ({t.count} trades).
                </p>
              ))}
            </DebriefCard>
          )}

          {/* Behavioral analysis */}
          {analysis && analysis.dowWinRates.length >= 2 && (
            <DebriefCard
              icon={<Calendar className="h-3.5 w-3.5" />}
              sentiment={analysis.dowWinRates[0].winRate >= 60 ? "positive" : "neutral"}
              label="Behavioral Analysis"
            >
              <p className="text-[11px] text-muted-foreground">
                You have a{" "}
                <span className="font-semibold text-green-400">
                  {analysis.dowWinRates[0].winRate.toFixed(0)}%
                </span>{" "}
                win rate on{" "}
                <span className="font-medium text-foreground/80">{analysis.dowWinRates[0].label}</span>
                , only{" "}
                <span className="font-semibold text-red-400">
                  {analysis.dowWinRates[analysis.dowWinRates.length - 1].winRate.toFixed(0)}%
                </span>{" "}
                on{" "}
                <span className="font-medium text-foreground/80">
                  {analysis.dowWinRates[analysis.dowWinRates.length - 1].label}
                </span>
                .
              </p>
            </DebriefCard>
          )}

          {/* Size analysis */}
          {analysis && analysis.sizeRatio !== null && (
            <DebriefCard
              icon={<BarChart2 className="h-3.5 w-3.5" />}
              sentiment={analysis.sizeRatio >= 1.5 ? "positive" : analysis.sizeRatio >= 1 ? "neutral" : "negative"}
              label="Size Analysis"
            >
              <p className="text-[11px] text-muted-foreground">
                Your average winner is{" "}
                <span
                  className={cn(
                    "font-semibold",
                    analysis.sizeRatio >= 1.5
                      ? "text-green-400"
                      : analysis.sizeRatio >= 1
                      ? "text-amber-400"
                      : "text-red-400",
                  )}
                >
                  {analysis.sizeRatio.toFixed(1)}×
                </span>{" "}
                your average loser (
                <span className="text-green-400">{formatCurrency(analysis.avgWin)}</span> vs{" "}
                <span className="text-red-400">{formatCurrency(analysis.avgLoss)}</span>).
              </p>
            </DebriefCard>
          )}

          {/* Time analysis */}
          {analysis && analysis.bestHoldingPeriod && (
            <DebriefCard
              icon={<Clock className="h-3.5 w-3.5" />}
              sentiment="neutral"
              label="Time Analysis"
            >
              <p className="text-[11px] text-muted-foreground">
                Best holding period:{" "}
                <span className="font-semibold text-green-400">{analysis.bestHoldingPeriod}</span>.
                {analysis.worstHoldingPeriod && (
                  <>
                    {" "}Worst:{" "}
                    <span className="font-semibold text-red-400">{analysis.worstHoldingPeriod}</span>.
                  </>
                )}
              </p>
            </DebriefCard>
          )}

          {rows.length < 5 && (
            <p className="text-xs text-muted-foreground/60">
              Add more trades and tags for richer insights.
            </p>
          )}
        </div>
      </div>

      {/* ── Emotion Tracking ─────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          Emotion Tracking
        </div>

        {totalEmotionRecorded === 0 ? (
          <p className="text-[11px] text-muted-foreground">
            Expand a trade in the Log tab and record how you felt. Emotion data will appear here.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Monthly distribution donut */}
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                This Month&apos;s Emotion Distribution
              </p>
              <div className="flex items-center gap-4">
                {analysis && (
                  <EmotionDonut counts={analysis.monthlyEmotionCounts} />
                )}
                <div className="space-y-1.5">
                  {EMOTION_ORDER.filter(
                    (e) => (analysis?.monthlyEmotionCounts[e] ?? 0) > 0,
                  ).map((e) => {
                    const cfg = EMOTION_CONFIG[e];
                    const count = analysis?.monthlyEmotionCounts[e] ?? 0;
                    const pct = totalEmotionRecorded > 0 ? ((count / totalEmotionRecorded) * 100).toFixed(0) : "0";
                    return (
                      <div key={e} className="flex items-center gap-1.5">
                        <span className="text-xs">{cfg.emoji}</span>
                        <span className="text-xs text-muted-foreground">{cfg.label}</span>
                        <span className={cn("ml-1 text-xs font-semibold tabular-nums", cfg.color)}>
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Win rate by emotion */}
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Win Rate by Emotion
              </p>
              {analysis && (
                <EmotionWinRateBar emotionStats={analysis.emotionStats} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Export ───────────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold">
          <Download className="h-3.5 w-3.5 text-muted-foreground" />
          Export Journal
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportCSV(rows, tradeTags, emotions, notes)}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <FileText className="h-3 w-3" />
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Download className="h-3 w-3" />
            Export PDF (Print)
          </button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground/50">
          CSV includes: date, ticker, direction, entry, exit, P&L, tags, emotions, notes
        </p>
      </div>
    </div>
  );
}

// ── DebriefCard ───────────────────────────────────────────────────────────────

function DebriefCard({
  icon,
  sentiment,
  label,
  children,
}: {
  icon: React.ReactNode;
  sentiment: "positive" | "negative" | "neutral";
  label: string;
  children: React.ReactNode;
}) {
  const borderColor =
    sentiment === "positive"
      ? "border-l-green-500"
      : sentiment === "negative"
      ? "border-l-red-500"
      : "border-l-blue-500";

  const iconColor =
    sentiment === "positive"
      ? "text-green-400"
      : sentiment === "negative"
      ? "text-red-400"
      : "text-primary";

  return (
    <div className={cn("rounded-lg border border-border bg-card/50 border-l-2 pl-3 pr-4 py-2.5", borderColor)}>
      <div className="flex items-start gap-2">
        <div className={cn("mt-0.5 shrink-0", iconColor)}>{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              {label}
            </span>
            {sentiment === "positive" ? (
              <CheckCircle2 className="h-2.5 w-2.5 text-green-400" />
            ) : sentiment === "negative" ? (
              <AlertCircle className="h-2.5 w-2.5 text-red-400" />
            ) : null}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
