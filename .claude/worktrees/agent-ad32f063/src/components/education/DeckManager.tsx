"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FLASHCARDS, CATEGORY_LABELS } from "@/data/flashcards";
import {
  useFlashcardStore,
  BUILTIN_DECKS,
  type Deck,
} from "@/stores/flashcard-store";
import {
  BookOpen,
  Plus,
  Trash2,
  Search,
  X,
  ChevronRight,
  Layers,
} from "lucide-react";

// ─── Deck card ─────────────────────────────────────────────────────────────────

interface DeckCardProps {
  deck: Deck;
  onStudy: (deck: Deck) => void;
  onDelete?: (deckId: string) => void;
}

function DeckCard({ deck, onStudy, onDelete }: DeckCardProps) {
  const getDeckDueCount = useFlashcardStore((s) => s.getDeckDueCount);
  const getDeckMasteryPct = useFlashcardStore((s) => s.getDeckMasteryPct);

  const dueCount = getDeckDueCount(deck);
  const masteryPct = getDeckMasteryPct(deck);
  const cardCount = deck.cardIds.length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="group relative flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-border/80 transition-colors"
    >
      {/* Icon */}
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">
        <Layers className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{deck.name}</p>
          {deck.isBuiltIn && (
            <span className="rounded-full border border-border bg-muted/60 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
              built-in
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>{cardCount} cards</span>
          <span className={cn(dueCount > 0 ? "text-orange-400" : "text-green-400")}>
            {dueCount} due
          </span>
          <span>{masteryPct}% mastered</span>
        </div>
        {/* Mastery bar */}
        <div className="mt-1.5 h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${masteryPct}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!deck.isBuiltIn && onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(deck.id);
            }}
            className="hidden group-hover:flex h-7 w-7 items-center justify-center rounded border border-border bg-card text-muted-foreground hover:text-rose-400 hover:border-rose-500/40 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onStudy(deck)}
          disabled={dueCount === 0}
          className={cn(
            "flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
            dueCount > 0
              ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
              : "border-border bg-muted/30 text-muted-foreground cursor-not-allowed",
          )}
        >
          Study
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Create deck modal ─────────────────────────────────────────────────────────

interface CreateDeckModalProps {
  onClose: () => void;
  onCreate: (name: string, cardIds: string[]) => void;
}

function CreateDeckModal({ onClose, onCreate }: CreateDeckModalProps) {
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return FLASHCARDS;
    return FLASHCARDS.filter(
      (c) =>
        c.front.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (CATEGORY_LABELS[c.category]?.label ?? "").toLowerCase().includes(q),
    );
  }, [search]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canCreate = name.trim().length > 0 && selectedIds.size > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.15 }}
        className="relative flex flex-col w-full max-w-lg max-h-[80vh] rounded-xl border border-border bg-card shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">Create custom deck</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedIds.size} card{selectedIds.size !== 1 ? "s" : ""} selected
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Deck name */}
        <div className="border-b border-border px-5 py-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Deck name..."
            maxLength={40}
            className="w-full rounded-md border border-border bg-muted/30 px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        {/* Search */}
        <div className="border-b border-border px-5 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cards..."
              className="w-full rounded-md border border-border bg-muted/30 pl-8 pr-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Card list */}
        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-1">
          {filtered.length === 0 && (
            <p className="py-6 text-center text-xs text-muted-foreground">No cards found</p>
          )}
          {filtered.map((card) => {
            const catLabel = CATEGORY_LABELS[card.category]?.label ?? card.category;
            const isSelected = selectedIds.has(card.id);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => toggle(card.id)}
                className={cn(
                  "w-full flex items-start gap-3 rounded-md border px-3 py-2 text-left transition-colors",
                  isSelected
                    ? "border-primary/40 bg-primary/10"
                    : "border-border bg-card hover:bg-muted/40",
                )}
              >
                <div className={cn(
                  "mt-0.5 h-3.5 w-3.5 flex-shrink-0 rounded border transition-colors",
                  isSelected ? "border-primary bg-primary" : "border-border",
                )} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium leading-tight line-clamp-1">
                    {card.front.split("\n")[0]}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{catLabel}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canCreate}
            onClick={() => onCreate(name.trim(), [...selectedIds])}
            className={cn(
              "rounded-md border px-4 py-1.5 text-xs font-medium transition-colors",
              canCreate
                ? "border-primary/40 bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border bg-muted/30 text-muted-foreground cursor-not-allowed",
            )}
          >
            Create deck
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── DeckManager ──────────────────────────────────────────────────────────────

interface DeckManagerProps {
  onStudyDeck: (deck: Deck) => void;
}

export function DeckManager({ onStudyDeck }: DeckManagerProps) {
  const [showCreate, setShowCreate] = useState(false);
  const customDecks = useFlashcardStore((s) => s.customDecks);
  const createDeck = useFlashcardStore((s) => s.createDeck);
  const deleteDeck = useFlashcardStore((s) => s.deleteDeck);

  const allDecks = useMemo(() => [...BUILTIN_DECKS, ...customDecks], [customDecks]);

  const handleCreate = (name: string, cardIds: string[]) => {
    createDeck(name, cardIds);
    setShowCreate(false);
  };

  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Decks</span>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Create deck
        </button>
      </div>

      {/* Deck list */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-0.5">
          Built-in decks
        </p>
        <AnimatePresence initial={false}>
          {BUILTIN_DECKS.map((deck) => (
            <DeckCard key={deck.id} deck={deck} onStudy={onStudyDeck} />
          ))}
        </AnimatePresence>
      </div>

      {customDecks.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-0.5">
            My decks
          </p>
          <AnimatePresence initial={false}>
            {customDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onStudy={onStudyDeck}
                onDelete={deleteDeck}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {customDecks.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          No custom decks yet. Create one to study a specific set of cards.
        </p>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateDeckModal
            onClose={() => setShowCreate(false)}
            onCreate={handleCreate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
