"use client";
import { useState, useMemo, useRef, useCallback } from "react";
import { GLOSSARY } from "@/data/glossary";
import type { GlossaryEntry } from "@/data/glossary";

// ---------------------------------------------------------------------------
// Difficulty assignment
// Per-category, sort terms alphabetically then assign:
//   first 30%  → beginner  (green)
//   next  40%  → intermediate (amber)
//   last  30%  → advanced  (red)
// ---------------------------------------------------------------------------
type Difficulty = "beginner" | "intermediate" | "advanced";

function buildDifficultyMap(): Map<string, Difficulty> {
  const map = new Map<string, Difficulty>();
  const byCategory = new Map<string, GlossaryEntry[]>();
  for (const entry of GLOSSARY) {
    const list = byCategory.get(entry.category) ?? [];
    list.push(entry);
    byCategory.set(entry.category, list);
  }
  byCategory.forEach((entries) => {
    const sorted = [...entries].sort((a, b) => a.term.localeCompare(b.term));
    const n = sorted.length;
    const beginnerEnd = Math.ceil(n * 0.3);
    const intermediateEnd = beginnerEnd + Math.ceil(n * 0.4);
    sorted.forEach((entry, i) => {
      let d: Difficulty;
      if (i < beginnerEnd) d = "beginner";
      else if (i < intermediateEnd) d = "intermediate";
      else d = "advanced";
      map.set(entry.term, d);
    });
  });
  return map;
}

const DIFFICULTY_MAP = buildDifficultyMap();

const DIFFICULTY_DOT: Record<Difficulty, string> = {
  beginner: "bg-green-500",
  intermediate: "bg-amber-500",
  advanced: "bg-red-500",
};

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

// ---------------------------------------------------------------------------
// "Term of the Day" — seeded by YYYY-MM-DD so it's stable for the day
// ---------------------------------------------------------------------------
function getDayTermIndex(): number {
  const today = new Date();
  const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();
  // Simple hash → index into GLOSSARY
  let h = seed ^ 0xdeadbeef;
  h = ((h ^ (h >>> 16)) * 0x45d9f3b) >>> 0;
  h = ((h ^ (h >>> 16)) * 0x45d9f3b) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h % GLOSSARY.length;
}

const TERM_OF_DAY = GLOSSARY[getDayTermIndex()];

// ---------------------------------------------------------------------------
// Quiz helpers
// ---------------------------------------------------------------------------
function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  while (result.length < n && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

function buildQuizOptions(correct: GlossaryEntry, pool: GlossaryEntry[]): string[] {
  const distractors = pool
    .filter((e) => e.term !== correct.term)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((e) => e.term);
  const options = [...distractors, correct.term].sort(() => Math.random() - 0.5);
  return options;
}

interface QuizQuestion {
  term: GlossaryEntry;
  options: string[];
}

// ---------------------------------------------------------------------------
// Export helper
// ---------------------------------------------------------------------------
function downloadGlossary(entries: GlossaryEntry[]) {
  const lines: string[] = ["FINSIM GLOSSARY\n" + "=".repeat(40) + "\n"];
  let currentCat = "";
  const sorted = [...entries].sort((a, b) =>
    a.category.localeCompare(b.category) || a.term.localeCompare(b.term)
  );
  for (const e of sorted) {
    if (e.category !== currentCat) {
      currentCat = e.category;
      lines.push(`\n-- ${currentCat.toUpperCase()} --\n`);
    }
    lines.push(`${e.term}`);
    lines.push(e.definition);
    if (e.example) lines.push(`Example: ${e.example}`);
    lines.push("");
  }
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "finsim-glossary.txt";
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedTerm, setCopiedTerm] = useState(false);

  // Quiz state
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  // Refs for scroll-to
  const termRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const categories = useMemo(() => {
    const cats = new Set(GLOSSARY.map((t) => t.category));
    return ["all", ...Array.from(cats).sort()];
  }, []);

  const filtered = useMemo(() => {
    return GLOSSARY.filter((t) => {
      const matchesSearch =
        search.length === 0 ||
        t.term.toLowerCase().includes(search.toLowerCase()) ||
        t.definition.toLowerCase().includes(search.toLowerCase());
      const matchesCat = activeCategory === "all" || t.category === activeCategory;
      return matchesSearch && matchesCat;
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [search, activeCategory]);

  // Group by first letter
  const grouped = useMemo(() => {
    const map = new Map<string, GlossaryEntry[]>();
    for (const term of filtered) {
      const letter = term.term[0].toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(term);
    }
    return map;
  }, [filtered]);

  const availableLetters = useMemo(() => Array.from(grouped.keys()).sort(), [grouped]);

  // ---------------------------------------------------------------------------
  // Related term navigation: clear search, expand target, scroll to it
  // ---------------------------------------------------------------------------
  const navigateToTerm = useCallback(
    (termName: string) => {
      // Find the entry
      const entry = GLOSSARY.find(
        (e) => e.term.toLowerCase() === termName.toLowerCase()
      );
      if (!entry) {
        // Fallback: search for it
        setSearch(termName);
        setExpandedId(null);
        return;
      }
      // Clear filters so it's visible
      setSearch("");
      setActiveCategory("all");
      setExpandedId(entry.term);
      // Scroll after render
      requestAnimationFrame(() => {
        const el = termRefs.current.get(entry.term);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Alphabet jump
  // ---------------------------------------------------------------------------
  const jumpToLetter = useCallback((letter: string) => {
    requestAnimationFrame(() => {
      const el = sectionRefs.current.get(letter);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Quiz
  // ---------------------------------------------------------------------------
  const startQuiz = useCallback(() => {
    const pool = filtered.length >= 5 ? filtered : GLOSSARY;
    const picked = pickRandom(pool, 5);
    const questions: QuizQuestion[] = picked.map((term) => ({
      term,
      options: buildQuizOptions(term, pool.length >= 4 ? pool : GLOSSARY),
    }));
    setQuizQuestions(questions);
    setQuizIndex(0);
    setQuizAnswer(null);
    setQuizScore(0);
    setQuizDone(false);
    setQuizMode(true);
  }, [filtered]);

  const handleQuizAnswer = useCallback(
    (answer: string) => {
      if (quizAnswer !== null) return; // already answered
      setQuizAnswer(answer);
      if (answer === quizQuestions[quizIndex].term.term) {
        setQuizScore((s) => s + 1);
      }
    },
    [quizAnswer, quizQuestions, quizIndex]
  );

  const nextQuestion = useCallback(() => {
    if (quizIndex + 1 >= quizQuestions.length) {
      setQuizDone(true);
    } else {
      setQuizIndex((i) => i + 1);
      setQuizAnswer(null);
    }
  }, [quizIndex, quizQuestions.length]);

  // ---------------------------------------------------------------------------
  // Share Term of Day
  // ---------------------------------------------------------------------------
  const shareTermOfDay = useCallback(() => {
    const text = `${TERM_OF_DAY.term}: ${TERM_OF_DAY.definition}${TERM_OF_DAY.example ? ` | Example: ${TERM_OF_DAY.example}` : ""}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedTerm(true);
      setTimeout(() => setCopiedTerm(false), 2000);
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Render — Quiz modal
  // ---------------------------------------------------------------------------
  if (quizMode) {
    return (
      <div className="p-6 max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Quiz Mode</h1>
          <button
            onClick={() => setQuizMode(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors border rounded px-3 py-1"
          >
            Exit quiz
          </button>
        </div>

        {quizDone ? (
          <div className="rounded-lg border bg-card p-8 space-y-4 text-center">
            <div className="text-4xl font-bold">{quizScore}/5</div>
            <p className="text-muted-foreground">
              {quizScore === 5
                ? "Perfect score — excellent work."
                : quizScore >= 3
                ? "Good job. Review the terms you missed."
                : "Keep studying — you can retake any time."}
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={startQuiz}
                className="px-4 py-2 rounded-md bg-[#2d9cdb] text-white text-sm font-medium hover:bg-[#2d9cdb]/90 transition-colors"
              >
                Retake quiz
              </button>
              <button
                onClick={() => setQuizMode(false)}
                className="px-4 py-2 rounded-md border text-sm font-medium hover:bg-muted/30 transition-colors"
              >
                Back to glossary
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Question {quizIndex + 1} of {quizQuestions.length}</span>
              <span>Score: {quizScore}</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2d9cdb] transition-all"
                style={{ width: `${((quizIndex) / quizQuestions.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                What term matches this definition?
              </p>
              <p className="text-sm leading-relaxed">
                {quizQuestions[quizIndex].term.definition}
              </p>
              {quizQuestions[quizIndex].term.example && (
                <p className="text-xs italic text-muted-foreground/70">
                  Example: {quizQuestions[quizIndex].term.example}
                </p>
              )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-2">
              {quizQuestions[quizIndex].options.map((opt) => {
                const isCorrect = opt === quizQuestions[quizIndex].term.term;
                const isSelected = opt === quizAnswer;
                let cls =
                  "px-4 py-3 rounded-lg border text-sm font-medium text-left transition-colors ";
                if (quizAnswer === null) {
                  cls += "hover:bg-muted/40 cursor-pointer";
                } else if (isCorrect) {
                  cls += "border-green-500 bg-green-500/10 text-green-600";
                } else if (isSelected && !isCorrect) {
                  cls += "border-red-500 bg-red-500/10 text-red-600";
                } else {
                  cls += "opacity-50 cursor-not-allowed";
                }
                return (
                  <button
                    key={opt}
                    onClick={() => handleQuizAnswer(opt)}
                    className={cls}
                    disabled={quizAnswer !== null}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {quizAnswer !== null && (
              <div className="flex justify-end">
                <button
                  onClick={nextQuestion}
                  className="px-4 py-2 rounded-md bg-[#2d9cdb] text-white text-sm font-medium hover:bg-[#2d9cdb]/90 transition-colors"
                >
                  {quizIndex + 1 >= quizQuestions.length ? "See results" : "Next question"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render — main glossary
  // ---------------------------------------------------------------------------
  return (
    <div className="p-6 space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Glossary</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length === GLOSSARY.length
              ? `${GLOSSARY.length} terms across all categories`
              : `Showing ${filtered.length} of ${GLOSSARY.length} terms`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={startQuiz}
            className="px-3 py-1.5 rounded-md border text-sm font-medium hover:bg-muted/30 transition-colors"
          >
            Quiz Me
          </button>
          <button
            onClick={() => downloadGlossary(filtered)}
            className="px-3 py-1.5 rounded-md border text-sm font-medium hover:bg-muted/30 transition-colors"
          >
            Download glossary
          </button>
        </div>
      </div>

      {/* Term of the Day */}
      <div className="rounded-lg border bg-card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Term of the Day
          </span>
          <button
            onClick={shareTermOfDay}
            className="text-xs border rounded px-2 py-1 hover:bg-muted/30 transition-colors"
          >
            {copiedTerm ? "Copied" : "Share this term"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-base">{TERM_OF_DAY.term}</span>
          <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
            {TERM_OF_DAY.category}
          </span>
          <DifficultyDot term={TERM_OF_DAY.term} />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {TERM_OF_DAY.definition}
        </p>
        {TERM_OF_DAY.example && (
          <p className="text-xs italic text-muted-foreground/70">
            Example: {TERM_OF_DAY.example}
          </p>
        )}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search terms..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-[#2d9cdb]"
      />

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              activeCategory === cat
                ? "border-[#2d9cdb] text-[#2d9cdb] bg-[#2d9cdb]/10"
                : "border-border text-muted-foreground hover:border-[#2d9cdb]/50"
            }`}
          >
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>

      {/* Difficulty legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium">Difficulty:</span>
        {(["beginner", "intermediate", "advanced"] as Difficulty[]).map((d) => (
          <span key={d} className="flex items-center gap-1.5">
            <span className={`inline-block w-2 h-2 rounded-full ${DIFFICULTY_DOT[d]}`} />
            {DIFFICULTY_LABEL[d]}
          </span>
        ))}
      </div>

      {/* Alphabet nav */}
      {availableLetters.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {availableLetters.map((letter) => (
            <button
              key={letter}
              onClick={() => jumpToLetter(letter)}
              className="w-7 h-7 flex items-center justify-center rounded text-xs font-semibold border hover:bg-muted/40 hover:border-[#2d9cdb]/50 transition-colors"
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      {/* Terms grouped by letter */}
      <div className="space-y-6">
        {Array.from(grouped.entries()).map(([letter, terms]) => (
          <div
            key={letter}
            ref={(el) => {
              if (el) sectionRefs.current.set(letter, el);
              else sectionRefs.current.delete(letter);
            }}
          >
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 border-b pb-1">
              {letter}
            </div>
            <div className="space-y-1">
              {terms.map((term) => (
                <div
                  key={term.term}
                  ref={(el) => {
                    if (el) termRefs.current.set(term.term, el);
                    else termRefs.current.delete(term.term);
                  }}
                  className="rounded-lg border bg-card overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                    onClick={() =>
                      setExpandedId(expandedId === term.term ? null : term.term)
                    }
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <DifficultyDot term={term.term} />
                      <span className="font-medium text-sm">{term.term}</span>
                      <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                        {term.category}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-xs flex-shrink-0 ml-2">
                      {expandedId === term.term ? "−" : "+"}
                    </span>
                  </button>
                  {expandedId === term.term && (
                    <div className="px-4 pb-4 pt-1 text-sm text-muted-foreground border-t bg-muted/10 space-y-2">
                      <p>{term.definition}</p>
                      {term.example && (
                        <p className="text-xs italic text-muted-foreground/70">
                          Example: {term.example}
                        </p>
                      )}
                      {term.relatedTerms && term.relatedTerms.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          <span className="text-xs text-muted-foreground/60">Related:</span>
                          {term.relatedTerms.map((rt) => (
                            <button
                              key={rt}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToTerm(rt);
                              }}
                              className="text-xs text-[#2d9cdb] hover:underline"
                            >
                              {rt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No terms found for &ldquo;{search}&rdquo;
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small helper component
// ---------------------------------------------------------------------------
function DifficultyDot({ term }: { term: string }) {
  const difficulty = DIFFICULTY_MAP.get(term) ?? "beginner";
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${DIFFICULTY_DOT[difficulty]}`}
      title={DIFFICULTY_LABEL[difficulty]}
    />
  );
}
