"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Plus, X, Trash2, ChevronDown, ChevronUp } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

export type NoteMood = "confident" | "neutral" | "anxious" | "frustrated";

export interface JournalNote {
  id: string;
  date: number; // timestamp
  mood: NoteMood;
  text: string;
}

// ── Storage key ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "finsim-journal-freenotes-v1";

function loadNotes(): JournalNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as JournalNote[]) : [];
  } catch {
    return [];
  }
}

function saveNotes(notes: JournalNote[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // ignore
  }
}

// ── Mood config ──────────────────────────────────────────────────────────────

const MOODS: {
  value: NoteMood;
  label: string;
  activeClass: string;
  badgeClass: string;
}[] = [
  {
    value: "confident",
    label: "Confident",
    activeClass: "border-green-500/60 bg-green-500/12 text-green-400",
    badgeClass: "bg-green-500/15 text-green-400 border-green-500/30",
  },
  {
    value: "neutral",
    label: "Neutral",
    activeClass: "border-blue-500/60 bg-blue-500/12 text-blue-400",
    badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  {
    value: "anxious",
    label: "Anxious",
    activeClass: "border-amber-500/60 bg-amber-500/12 text-amber-400",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  {
    value: "frustrated",
    label: "Frustrated",
    activeClass: "border-red-500/60 bg-red-500/12 text-red-400",
    badgeClass: "bg-red-500/15 text-red-400 border-red-500/30",
  },
];

function getMoodConfig(mood: NoteMood) {
  return MOODS.find((m) => m.value === mood) ?? MOODS[1];
}

function formatNoteDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }) + " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// ── Component ────────────────────────────────────────────────────────────────

export function JournalNotes() {
  const [notes, setNotes] = useState<JournalNote[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [draftText, setDraftText] = useState("");
  const [draftMood, setDraftMood] = useState<NoteMood>("neutral");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Load on mount
  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  // Focus textarea when form opens
  useEffect(() => {
    if (showForm && textRef.current) {
      textRef.current.focus();
    }
  }, [showForm]);

  function handleAdd() {
    if (!draftText.trim()) return;
    const note: JournalNote = {
      id: crypto.randomUUID(),
      date: Date.now(),
      mood: draftMood,
      text: draftText.trim(),
    };
    const updated = [note, ...notes];
    setNotes(updated);
    saveNotes(updated);
    setDraftText("");
    setDraftMood("neutral");
    setShowForm(false);
  }

  function handleDelete(id: string) {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
    if (expandedId === id) setExpandedId(null);
  }

  function handleCancel() {
    setDraftText("");
    setDraftMood("neutral");
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      {/* Header + Add button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Journal Notes</p>
          <p className="text-[10px] text-muted-foreground">
            {notes.length} {notes.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Note
          </button>
        )}
      </div>

      {/* Inline add form */}
      {showForm && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            New Entry
          </p>

          {/* Mood selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground">Mood</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setDraftMood(m.value)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
                    draftMood === m.value
                      ? m.activeClass
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text area */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground">
              Thoughts &amp; observations
            </label>
            <textarea
              ref={textRef}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="What happened today? How are you feeling about your trades? Any lessons or patterns noticed..."
              rows={4}
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary/50 transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleAdd();
                }
              }}
            />
            <p className="text-[9px] text-muted-foreground/50">
              Cmd+Enter to save
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent/30 hover:text-foreground"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!draftText.trim()}
              className="flex items-center gap-1 rounded-md bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground transition-opacity disabled:opacity-40"
            >
              Save Note
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      {notes.length === 0 && !showForm ? (
        <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground rounded-lg border border-dashed border-border/50">
          <p className="text-sm">No journal notes yet.</p>
          <p className="text-[11px] text-muted-foreground/60">
            Capture your thoughts, observations, and lessons.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => {
            const mood = getMoodConfig(note.mood);
            const isExpanded = expandedId === note.id;
            const preview = note.text.slice(0, 120);
            const needsExpand = note.text.length > 120;

            return (
              <div
                key={note.id}
                className="rounded-lg border border-border bg-card transition-colors hover:border-border/70"
              >
                {/* Note header */}
                <div className="flex items-start gap-3 p-3">
                  {/* Mood badge */}
                  <span
                    className={cn(
                      "mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                      mood.badgeClass,
                    )}
                  >
                    {mood.label}
                  </span>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[10px] text-muted-foreground">
                      {formatNoteDate(note.date)}
                    </p>
                    <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {isExpanded ? note.text : preview}
                      {!isExpanded && needsExpand && (
                        <span className="text-muted-foreground/60">…</span>
                      )}
                    </p>
                    {needsExpand && (
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : note.id)
                        }
                        className="mt-1.5 flex items-center gap-0.5 text-[10px] text-primary/70 transition-colors hover:text-primary"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3" /> Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" /> Show more
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="shrink-0 rounded p-1 text-muted-foreground/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    title="Delete note"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
