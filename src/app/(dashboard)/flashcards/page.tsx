"use client";

import { useState, useMemo } from "react";
import { Brain, Search, Star, BarChart2, BookOpen, Grid } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useFlashcardStore } from "@/stores/flashcard-store";
import { FLASHCARDS, CATEGORY_LABELS } from "@/data/flashcards";
import {
  AdaptiveFlashcards,
  SessionStatsPanel,
  type SessionStats,
} from "@/components/education/AdaptiveFlashcards";

// ─── Constants ─────────────────────────────────────────────────────────────

const DECK_FILTERS = [
  { id: "all", label: "All" },
  { id: "basics", label: "Basics" },
  { id: "indicators", label: "Indicators" },
  { id: "orders", label: "Orders" },
  { id: "risk", label: "Risk" },
  { id: "fundamental", label: "Fundamental" },
  { id: "quant", label: "Quant" },
  { id: "options-advanced", label: "Options" },
  { id: "crypto", label: "Crypto" },
  { id: "macro", label: "Macro" },
  { id: "technical", label: "Technical" },
  { id: "predictions", label: "Predictions" },
  { id: "personal-finance", label: "Personal Finance" },
] as const;

// ─── Browse Tab ─────────────────────────────────────────────────────────────

function BrowseTab() {
  const [query, setQuery] = useState("");
  const [deck, setDeck] = useState("all");
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [flippedCards, setFlippedCards] = useState<Set<string>>(() => new Set());

  const filtered = useMemo(() => {
    let cards = FLASHCARDS;
    if (deck !== "all") {
      cards = cards.filter((c) => c.category === deck);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      cards = cards.filter(
        (c) =>
          c.front.toLowerCase().includes(q) ||
          c.back.toLowerCase().includes(q),
      );
    }
    return cards;
  }, [query, deck]);

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-8 pl-8 text-xs"
          placeholder="Search terms..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Deck filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {DECK_FILTERS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setDeck(d.id)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
              deck === d.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/50 bg-muted/30 text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p className="text-[11px] text-muted-foreground">
        {filtered.length} card{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {filtered.map((card) => {
          const isFlipped = flippedCards.has(card.id);
          const isFav = favorites.has(card.id);
          const cat = CATEGORY_LABELS[card.category];

          return (
            <div
              key={card.id}
              className="perspective-1000"
            >
              <div
                className={cn(
                  "card-flip-container cursor-pointer",
                  isFlipped && "flipped",
                )}
                onClick={() => toggleFlip(card.id)}
                style={{ minHeight: 100 }}
              >
                {/* Front */}
                <div className="card-flip-front rounded-lg border border-border bg-card p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    {cat && (
                      <span
                        className={cn(
                          "text-[11px] font-bold",
                          cat.color,
                        )}
                      >
                        {cat.label}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFav(card.id);
                      }}
                      className="ml-auto rounded p-0.5 hover:bg-accent/40"
                    >
                      <Star
                        className={cn(
                          "h-3 w-3",
                          isFav
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground",
                        )}
                      />
                    </button>
                  </div>
                  <p className="text-xs font-semibold leading-snug whitespace-pre-line">
                    {card.front}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Click to reveal</p>
                </div>

                {/* Back */}
                <div className="card-flip-back rounded-lg border border-primary/20 bg-card p-3 flex flex-col gap-2">
                  {cat && (
                    <span
                      className={cn(
                        "text-[11px] font-bold",
                        cat.color,
                      )}
                    >
                      {cat.label}
                    </span>
                  )}
                  <p className="text-[11px] leading-relaxed text-foreground/90 whitespace-pre-line">
                    {card.back}
                  </p>
                  {card.hint && (
                    <p className="text-[11px] text-muted-foreground italic border-t border-border/40 pt-1.5">
                      {card.hint}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
            <Brain className="mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No cards found</p>
            <p className="text-xs text-muted-foreground/60">
              Try a different search or deck filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stats Tab ──────────────────────────────────────────────────────────────

function StatsTab() {
  const mastery = useFlashcardStore((s) => s.mastery);
  const totalReviewed = useFlashcardStore((s) => s.totalReviewed);
  const totalCorrect = useFlashcardStore((s) => s.totalCorrect);
  const dailyCardsReviewed = useFlashcardStore((s) => s.dailyCardsReviewed);
  const lastReviewDate = useFlashcardStore((s) => s.lastReviewDate);
  const getOverallMastery = useFlashcardStore((s) => s.getOverallMastery);

  const today = new Date().toISOString().slice(0, 10);
  const todayCards = lastReviewDate === today ? dailyCardsReviewed : 0;
  const accuracy =
    totalReviewed > 0 ? Math.round((totalCorrect / totalReviewed) * 100) : 0;
  const overallMastery = getOverallMastery();

  // Compute studied card count (seen at least once)
  const seenCount = Object.keys(mastery).length;
  const totalCards = FLASHCARDS.length;
  const dueCount = totalCards - seenCount;

  // Compute per-deck stats
  const deckStats = useMemo(() => {
    const counts: Record<string, { total: number; mastered: number }> = {};
    for (const card of FLASHCARDS) {
      const cat = card.category;
      if (!counts[cat]) counts[cat] = { total: 0, mastered: 0 };
      counts[cat].total++;
      const m = mastery[card.id];
      if (m) {
        const t = m.correct + m.incorrect;
        if (t > 0 && m.correct / t >= 0.8) counts[cat].mastered++;
      }
    }
    return Object.entries(counts)
      .map(([cat, { total, mastered }]) => ({
        cat,
        label: CATEGORY_LABELS[cat]?.label ?? cat,
        color: CATEGORY_LABELS[cat]?.color ?? "text-muted-foreground",
        total,
        mastered,
        pct: Math.round((mastered / total) * 100),
      }))
      .sort((a, b) => b.pct - a.pct);
  }, [mastery]);

  // 30-day heatmap data (simulated using totalReviewed for distribution)
  const heatmapData = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      // Use mastery lastSeen to count cards reviewed on each day
      let count = 0;
      if (dateStr === today) {
        count = todayCards;
      } else {
        // Estimate: distribute totalReviewed roughly over past 30 days
        // We don't persist per-day history, so use lastSeen timestamps
        for (const m of Object.values(mastery)) {
          const lastSeenDate = new Date(m.lastSeen).toISOString().slice(0, 10);
          if (lastSeenDate === dateStr) count++;
        }
      }
      days.push({ date: dateStr, count });
    }
    return days;
  }, [mastery, today, todayCards]);

  const maxCount = Math.max(...heatmapData.map((d) => d.count), 1);

  const cellIntensity = (count: number) => {
    if (count === 0) return "bg-muted/30";
    const ratio = count / maxCount;
    if (ratio < 0.25) return "bg-primary/20";
    if (ratio < 0.5) return "bg-primary/40";
    if (ratio < 0.75) return "bg-primary/60";
    return "bg-primary/90";
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard label="Today" value={String(todayCards)} sub="cards reviewed" />
        <StatCard
          label="Total Reviewed"
          value={String(totalReviewed)}
          sub="lifetime"
        />
        <StatCard
          label="Accuracy"
          value={`${accuracy}%`}
          sub={`${totalCorrect} correct`}
          valueColor={
            accuracy >= 80
              ? "text-green-400"
              : accuracy >= 60
                ? "text-amber-400"
                : "text-rose-400"
          }
        />
        <StatCard
          label="Overall Mastery"
          value={`${overallMastery}%`}
          sub={`${seenCount}/${totalCards} seen`}
          valueColor={
            overallMastery >= 80
              ? "text-green-400"
              : overallMastery >= 50
                ? "text-amber-400"
                : "text-muted-foreground"
          }
        />
      </div>

      {/* Cards due */}
      <div className="rounded-lg border border-border/50 bg-card px-4 py-3">
        <p className="text-xs font-bold text-muted-foreground">
          Cards due for review
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
          {dueCount}
        </p>
        <p className="text-xs text-muted-foreground">unseen cards remaining</p>
      </div>

      {/* 30-day heatmap */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <h3 className="mb-3 text-xs font-semibold">30-Day Study Activity</h3>
        <div className="flex flex-wrap gap-1">
          {heatmapData.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.count} cards`}
              className={cn(
                "h-3.5 w-3.5 rounded-sm transition-colors",
                cellIntensity(day.count),
              )}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-0.5">
            {["bg-muted/30", "bg-primary/20", "bg-primary/40", "bg-primary/60", "bg-primary/90"].map(
              (cls, i) => (
                <div key={i} className={cn("h-2.5 w-2.5 rounded-sm", cls)} />
              ),
            )}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Performance by deck */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <h3 className="mb-3 text-xs font-semibold">Performance by Deck</h3>
        <div className="flex flex-col gap-2.5">
          {deckStats.map(({ cat, label, color, total, mastered, pct }) => (
            <div key={cat} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className={cn("text-[11px] font-medium", color)}>
                  {label}
                </span>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {mastered}/{total} · {pct}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
          {deckStats.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No cards reviewed yet. Start studying to see stats.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  valueColor = "text-foreground",
}: {
  label: string;
  value: string;
  sub: string;
  valueColor?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border/50 bg-card px-3 py-2.5">
      <span className="text-[11px] font-bold text-muted-foreground">
        {label}
      </span>
      <span className={cn("text-sm font-bold tabular-nums", valueColor)}>
        {value}
      </span>
      <span className="text-[11px] text-muted-foreground">{sub}</span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FlashcardsPage() {
  const overallMastery = useFlashcardStore((s) => s.getOverallMastery());
  const totalReviewed = useFlashcardStore((s) => s.totalReviewed);

  const [sessionStats, setSessionStats] = useState<SessionStats>({
    reviewed: 0,
    correct: 0,
    startTime: Date.now(),
    newCards: 0,
    reviewCards: 0,
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 bg-card px-4 py-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
            <Brain className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Flashcards</h1>
            <p className="text-muted-foreground text-xs">
              {FLASHCARDS.length} cards &middot; {overallMastery}% mastery &middot;{" "}
              {totalReviewed} lifetime reviews
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="study" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="mx-4 mt-3 mb-1 shrink-0 h-8 w-auto self-start gap-0 rounded-md bg-muted/40 p-0.5">
          <TabsTrigger value="study" className="flex items-center gap-1.5 h-7 px-3 text-xs">
            <BookOpen className="h-3 w-3" />
            Study
          </TabsTrigger>
          <TabsTrigger value="browse" className="flex items-center gap-1.5 h-7 px-3 text-xs">
            <Grid className="h-3 w-3" />
            Browse
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-1.5 h-7 px-3 text-xs">
            <BarChart2 className="h-3 w-3" />
            Stats
          </TabsTrigger>
        </TabsList>

        {/* Study Tab */}
        <TabsContent
          value="study"
          className="flex flex-1 flex-col overflow-hidden data-[state=inactive]:hidden m-0 mt-0"
        >
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-3">
            <SessionStatsPanel stats={sessionStats} />
            <div className="flex flex-1 flex-col">
              <AdaptiveFlashcards onSessionStats={setSessionStats} />
            </div>
          </div>
        </TabsContent>

        {/* Browse Tab */}
        <TabsContent
          value="browse"
          className="flex-1 overflow-y-auto data-[state=inactive]:hidden m-0 mt-0"
        >
          <div className="px-4 py-3">
            <BrowseTab />
          </div>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent
          value="stats"
          className="flex-1 overflow-y-auto data-[state=inactive]:hidden m-0 mt-0"
        >
          <div className="px-4 py-3">
            <StatsTab />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
