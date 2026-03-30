"use client";

import { useMemo } from "react";
import { FLASHCARDS } from "@/data/flashcards";
import { useFlashcardStore } from "@/stores/flashcard-store";
import { cn } from "@/lib/utils";
import { BookOpen, CheckCircle, Flame, Clock, BarChart2 } from "lucide-react";

// ─── Retention curve forecast ──────────────────────────────────────────────────

interface DayBucket {
  day: number;   // 0 = today, 1 = tomorrow, …
  count: number;
}

function buildForecast(
  sm2: Record<string, { nextReview: number; interval: number }>,
): DayBucket[] {
  const now = Date.now();
  const DAY_MS = 86_400_000;
  const buckets = Array.from({ length: 30 }, (_, i) => ({ day: i, count: 0 }));

  for (const rec of Object.values(sm2)) {
    if (!rec.nextReview) continue;
    const daysUntil = Math.floor((rec.nextReview - now) / DAY_MS);
    if (daysUntil >= 0 && daysUntil < 30) {
      buckets[daysUntil].count++;
    }
  }

  return buckets;
}

// ─── SVG retention curve ───────────────────────────────────────────────────────

function RetentionCurve({ buckets }: { buckets: DayBucket[] }) {
  const W = 480;
  const H = 80;
  const PAD_L = 24;
  const PAD_R = 8;
  const PAD_T = 8;
  const PAD_B = 18;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const maxCount = Math.max(1, ...buckets.map((b) => b.count));

  const toX = (day: number) => PAD_L + (day / 29) * plotW;
  const toY = (count: number) => PAD_T + plotH - (count / maxCount) * plotH;

  // Build bar path
  const bars = buckets.map((b) => {
    const x = toX(b.day);
    const barW = plotW / 30 - 1;
    const h = (b.count / maxCount) * plotH;
    return { x, y: PAD_T + plotH - h, w: barW, h, day: b.day, count: b.count };
  });

  // Build sparkline polyline for top edge
  const points = buckets
    .map((b) => `${toX(b.day)},${toY(b.count)}`)
    .join(" ");

  // Y-axis labels
  const yLabels = [0, Math.round(maxCount / 2), maxCount].map((v, i) => ({
    v,
    y: PAD_T + plotH - (v / maxCount) * plotH,
    idx: i,
  }));

  // X-axis labels: today, day 7, day 14, day 21, day 29
  const xLabels = [0, 7, 14, 21, 29].map((d) => ({
    d,
    x: toX(d),
    label: d === 0 ? "today" : `+${d}d`,
  }));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: 80 }}
      aria-label="Reviews due per day over next 30 days"
    >
      {/* Grid lines */}
      {yLabels.map(({ y, idx }) => (
        <line
          key={idx}
          x1={PAD_L}
          y1={y}
          x2={W - PAD_R}
          y2={y}
          stroke="var(--border)"
          strokeWidth={0.5}
          strokeDasharray="3 3"
        />
      ))}

      {/* Bars */}
      {bars.map(({ x, y, w, h, day, count }) => (
        <rect
          key={day}
          x={x}
          y={y}
          width={w}
          height={h}
          rx={1}
          className={cn(
            "transition-all",
            day === 0 ? "fill-primary opacity-90" : "fill-primary opacity-30",
          )}
        />
      ))}

      {/* Sparkline */}
      <polyline
        points={points}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={1}
        opacity={0.6}
      />

      {/* Y-axis labels */}
      {yLabels.map(({ v, y, idx }) => (
        <text
          key={idx}
          x={PAD_L - 3}
          y={y + 3}
          fontSize={7}
          textAnchor="end"
          fill="var(--muted-foreground)"
        >
          {v}
        </text>
      ))}

      {/* X-axis labels */}
      {xLabels.map(({ d, x, label }) => (
        <text
          key={d}
          x={x}
          y={H - 2}
          fontSize={7}
          textAnchor="middle"
          fill="var(--muted-foreground)"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}

// ─── FlashcardStats ────────────────────────────────────────────────────────────

export function FlashcardStats() {
  const sm2 = useFlashcardStore((s) => s.sm2);
  const studyStreak = useFlashcardStore((s) => s.studyStreak);
  const totalReviewed = useFlashcardStore((s) => s.totalReviewed);
  const totalCorrect = useFlashcardStore((s) => s.totalCorrect);
  const dailyCardsReviewed = useFlashcardStore((s) => s.dailyCardsReviewed);

  const now = Date.now();
  const DAY_MS = 86_400_000;

  const { mastered, learning, newCards, dueToday } = useMemo(() => {
    let mastered = 0;
    let learning = 0;
    let newCards = 0;
    let dueToday = 0;

    for (const card of FLASHCARDS) {
      const rec = sm2[card.id];
      if (!rec || rec.interval === 0) {
        newCards++;
        dueToday++;
      } else if (rec.interval > 21) {
        mastered++;
        if (rec.nextReview <= now) dueToday++;
      } else {
        learning++;
        if (rec.nextReview <= now) dueToday++;
      }
    }
    return { mastered, learning, newCards, dueToday };
  }, [sm2, now]);

  const accuracy =
    totalReviewed > 0 ? Math.round((totalCorrect / totalReviewed) * 100) : null;

  const forecast = useMemo(() => buildForecast(sm2), [sm2]);

  // Total cards reviewed in streak window (simple heuristic: use totalReviewed)
  const statItems = [
    {
      icon: BookOpen,
      label: "Total cards",
      value: String(FLASHCARDS.length),
      subLabel: null,
    },
    {
      icon: CheckCircle,
      label: "Mastered",
      value: String(mastered),
      subLabel: `interval > 21d`,
    },
    {
      icon: BarChart2,
      label: "Learning",
      value: String(learning),
      subLabel: null,
    },
    {
      icon: Clock,
      label: "New",
      value: String(newCards),
      subLabel: "never studied",
    },
  ];

  return (
    <div className="space-y-4 py-4">
      {/* Section title */}
      <div className="flex items-center gap-2">
        <BarChart2 className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Statistics</span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-2">
        {statItems.map(({ icon: Icon, label, value, subLabel }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center rounded-lg border border-border bg-card px-2 py-3 text-center gap-1"
          >
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="font-mono text-base font-bold tabular-nums">{value}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
            {subLabel && (
              <p className="text-[9px] text-muted-foreground/60 leading-tight">{subLabel}</p>
            )}
          </div>
        ))}
      </div>

      {/* Streak + accuracy row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-border bg-card px-3 py-2.5 text-center">
          <div className="flex items-center justify-center gap-1">
            <Flame className={cn("h-3.5 w-3.5", studyStreak > 0 ? "text-orange-400" : "text-muted-foreground")} />
            <p className="font-mono text-sm font-bold tabular-nums">
              {studyStreak}
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Study streak</p>
        </div>

        <div className="rounded-lg border border-border bg-card px-3 py-2.5 text-center">
          <p className={cn(
            "font-mono text-sm font-bold tabular-nums",
            dueToday > 0 ? "text-orange-400" : "text-green-400",
          )}>
            {dueToday}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Due today</p>
        </div>

        <div className="rounded-lg border border-border bg-card px-3 py-2.5 text-center">
          <p className={cn(
            "font-mono text-sm font-bold tabular-nums",
            accuracy !== null && accuracy >= 80 ? "text-green-400" : "text-muted-foreground",
          )}>
            {accuracy !== null ? `${accuracy}%` : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Accuracy</p>
        </div>
      </div>

      {/* Today's session */}
      <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Cards reviewed today</span>
        <span className="font-mono text-xs font-semibold">{dailyCardsReviewed}</span>
      </div>

      {/* Retention curve */}
      <div className="rounded-lg border border-border bg-card px-4 py-3 space-y-2">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Reviews forecast — next 30 days
        </p>
        <RetentionCurve buckets={forecast} />
        <p className="text-[9px] text-muted-foreground">
          Brighter bar = today. Based on current SM-2 schedules.
        </p>
      </div>
    </div>
  );
}
