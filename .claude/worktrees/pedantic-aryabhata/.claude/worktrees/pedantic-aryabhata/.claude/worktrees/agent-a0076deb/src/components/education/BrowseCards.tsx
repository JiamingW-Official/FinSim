"use client";

import { useState, useMemo } from "react";
import { FLASHCARDS, CATEGORY_LABELS, type FlashcardItem } from "@/data/flashcards";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, ChevronRight } from "lucide-react";

// Ordered category list for display
const CATEGORY_ORDER = [
  "basics",
  "orders",
  "indicators",
  "risk",
  "fundamental",
  "personal-finance",
  "quant",
  "predictions",
];

function getFallbackLabel(cat: string): { label: string; color: string } {
  return { label: cat.charAt(0).toUpperCase() + cat.slice(1), color: "text-muted-foreground" };
}

function getCatMeta(cat: string): { label: string; color: string } {
  return CATEGORY_LABELS[cat] ?? getFallbackLabel(cat);
}

// Single accordion row for one card
function CardRow({ card }: { card: FlashcardItem }) {
  const [open, setOpen] = useState(false);
  const front = card.front.split("\n")[0]; // first line as title

  return (
    <div className="border-b border-border/40 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-accent/20 transition-colors"
      >
        <span className="flex-1 text-xs font-medium leading-snug">{front}</span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-1.5">
          {/* Back / answer */}
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
            {card.back}
          </p>
          {card.hint && (
            <p className="text-[10px] text-primary/70 italic">Hint: {card.hint}</p>
          )}
        </div>
      )}
    </div>
  );
}

// One category section (accordion group)
function CategorySection({
  category,
  cards,
}: {
  category: string;
  cards: FlashcardItem[];
}) {
  const [open, setOpen] = useState(false);
  const { label, color } = getCatMeta(category);

  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 bg-muted/30 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors"
      >
        <span className={cn("text-xs font-semibold uppercase tracking-wider", color)}>
          {label}
        </span>
        <span className="ml-auto flex items-center gap-2">
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {cards.length}
          </span>
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </span>
      </button>
      {open && (
        <div className="bg-card divide-y-0">
          {cards.map((card) => (
            <CardRow key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}

export function BrowseCards() {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");

  // Build category -> cards map (preserving display order)
  const byCategory = useMemo(() => {
    const map = new Map<string, FlashcardItem[]>();
    for (const order of CATEGORY_ORDER) {
      map.set(order, []);
    }
    for (const card of FLASHCARDS) {
      if (!map.has(card.category)) map.set(card.category, []);
      map.get(card.category)!.push(card);
    }
    return map;
  }, []);

  const categories = useMemo(() => {
    const cats: string[] = [];
    for (const [cat] of byCategory) {
      if (byCategory.get(cat)!.length > 0) cats.push(cat);
    }
    return cats;
  }, [byCategory]);

  const query = search.trim().toLowerCase();

  // Filtered cards for the currently active category pill
  const filteredByCategory = useMemo(() => {
    if (filterCat === "all") return FLASHCARDS;
    return byCategory.get(filterCat) ?? [];
  }, [filterCat, byCategory]);

  // Apply search filter
  const filteredCards = useMemo(() => {
    if (!query) return filteredByCategory;
    return filteredByCategory.filter(
      (c) =>
        c.front.toLowerCase().includes(query) ||
        c.back.toLowerCase().includes(query) ||
        (c.hint ?? "").toLowerCase().includes(query),
    );
  }, [filteredByCategory, query]);

  // When searching, group results by category for display
  const searchGrouped = useMemo(() => {
    if (!query && filterCat !== "all") return null; // single-category: use CategorySection directly
    if (!query) return null; // no search, no filter: use normal category sections
    // Grouped search results
    const map = new Map<string, FlashcardItem[]>();
    for (const card of filteredCards) {
      if (!map.has(card.category)) map.set(card.category, []);
      map.get(card.category)!.push(card);
    }
    return map;
  }, [query, filterCat, filteredCards]);

  const totalCount = FLASHCARDS.length;

  return (
    <div className="space-y-4 py-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search cards…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setFilterCat("all")}
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors border",
            filterCat === "all"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          All{" "}
          <span className="opacity-60">{totalCount}</span>
        </button>
        {categories.map((cat) => {
          const { label, color } = getCatMeta(cat);
          const count = byCategory.get(cat)!.length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCat(cat)}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors border",
                filterCat === cat
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <span className={filterCat === cat ? undefined : color}>{label}</span>{" "}
              <span className="opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Results summary when searching */}
      {query && (
        <p className="text-[11px] text-muted-foreground">
          {filteredCards.length} result{filteredCards.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
        </p>
      )}

      {/* Card list */}
      <div className="space-y-2">
        {/* Searching: show grouped results across categories */}
        {query && searchGrouped && (
          <>
            {searchGrouped.size === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-8">
                No cards match your search.
              </p>
            ) : (
              [...searchGrouped.entries()].map(([cat, cards]) => (
                <CategorySection key={cat} category={cat} cards={cards} />
              ))
            )}
          </>
        )}

        {/* No search + single category filter: show that category's sections open */}
        {!query && filterCat !== "all" && (
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <div className="bg-muted/30 px-4 py-2.5 flex items-center gap-3">
              <span className={cn("text-xs font-semibold uppercase tracking-wider", getCatMeta(filterCat).color)}>
                {getCatMeta(filterCat).label}
              </span>
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {filteredCards.length}
              </span>
            </div>
            <div className="bg-card">
              {filteredCards.map((card) => (
                <CardRow key={card.id} card={card} />
              ))}
            </div>
          </div>
        )}

        {/* No search + All: show collapsible category sections */}
        {!query && filterCat === "all" && (
          <>
            {categories.map((cat) => (
              <CategorySection
                key={cat}
                category={cat}
                cards={byCategory.get(cat)!}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
