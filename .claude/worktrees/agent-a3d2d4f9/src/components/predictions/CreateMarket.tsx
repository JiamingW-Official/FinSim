"use client";

import { useState, useCallback } from "react";
import {
  PlusCircle,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type Category = "macro" | "earnings" | "crypto" | "politics" | "commodities" | "custom";

interface CreatedMarket {
  id: string;
  question: string;
  category: Category;
  initialProbability: number;
  resolutionDate: string;
  resolutionCriteria: string;
  createdAt: number;
}

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "macro", label: "Macro / Fed" },
  { value: "earnings", label: "Earnings" },
  { value: "crypto", label: "Crypto" },
  { value: "politics", label: "Politics" },
  { value: "commodities", label: "Commodities" },
  { value: "custom", label: "Custom" },
];

// ── Educational content ───────────────────────────────────────────────────────

const GOOD_QUESTION_TIPS = [
  "Must be binary — a clear YES or NO answer at resolution.",
  "Define unambiguous resolution criteria in advance (e.g., 'as reported by the BLS').",
  "Avoid vague language: 'significantly' or 'roughly' create disputes.",
  "Set a specific resolution date so the market cannot stay open indefinitely.",
  "Avoid questions about events with obvious answers — markets need genuine uncertainty.",
];

const EXAMPLE_QUESTIONS = [
  "Will the Federal Reserve cut rates at the May 2026 FOMC meeting?",
  "Will NVIDIA's Q2 2026 EPS beat the consensus estimate?",
  "Will Bitcoin close above $100,000 on December 31, 2026?",
  "Will the US unemployment rate exceed 4.5% in Q3 2026?",
  "Will the US and EU reach a trade agreement before September 2026?",
];

// ── Storage ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = "finsim_created_markets_v1";

function loadCreatedMarkets(): CreatedMarket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CreatedMarket[]) : [];
  } catch {
    return [];
  }
}

function saveCreatedMarkets(markets: CreatedMarket[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(markets));
  } catch {
    // ignore
  }
}

// ── Probability bar ───────────────────────────────────────────────────────────

function ProbabilityBar({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">Initial YES probability</span>
        <span className="font-mono font-semibold tabular-nums text-foreground">{value}%</span>
      </div>
      <input
        type="range"
        min={5}
        max={95}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
      <div className="mt-1 flex items-center justify-between text-[9px] text-muted-foreground font-mono">
        <span>5% (very unlikely)</span>
        <span>50% (coin flip)</span>
        <span>95% (near certain)</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-red-500/20">
        <div
          className="h-full rounded-full bg-green-500/60 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
        <span className="text-green-400">YES {value}%</span>
        <span className="text-red-400">NO {100 - value}%</span>
      </div>
    </div>
  );
}

// ── Created market card ───────────────────────────────────────────────────────

function CreatedMarketCard({
  market,
  onDelete,
}: {
  market: CreatedMarket;
  onDelete: (id: string) => void;
}) {
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(market.resolutionDate).getTime() - Date.now()) / 86_400_000,
    ),
  );

  return (
    <div className="rounded-lg border border-border bg-card p-3.5">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-center gap-1.5">
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-primary">
              {market.category}
            </span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
              {daysLeft}d left
            </span>
          </div>
          <p className="text-[12px] font-medium leading-snug text-foreground">
            {market.question}
          </p>
        </div>
        <button
          onClick={() => onDelete(market.id)}
          className="shrink-0 rounded px-1.5 py-1 text-[10px] text-muted-foreground transition-colors hover:text-red-400"
          title="Delete"
        >
          &times;
        </button>
      </div>

      <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-red-500/20">
        <div
          className="h-full rounded-full bg-green-500/60"
          style={{ width: `${market.initialProbability}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px]">
        <span className="font-mono tabular-nums text-green-400">YES {market.initialProbability}%</span>
        <span className="font-mono tabular-nums text-red-400">NO {100 - market.initialProbability}%</span>
      </div>

      {market.resolutionCriteria && (
        <p className="mt-2 text-[10px] text-muted-foreground line-clamp-2 border-t border-border pt-2">
          {market.resolutionCriteria}
        </p>
      )}

      <div className="mt-2 text-[9px] text-muted-foreground">
        Created {new Date(market.createdAt).toLocaleDateString()} · Resolves {market.resolutionDate}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function CreateMarket() {
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState<Category>("macro");
  const [probability, setProbability] = useState(50);
  const [resolutionDate, setResolutionDate] = useState("");
  const [resolutionCriteria, setResolutionCriteria] = useState("");
  const [showTips, setShowTips] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdMarkets, setCreatedMarkets] = useState<CreatedMarket[]>(() =>
    loadCreatedMarkets(),
  );

  // Validation
  const questionTooShort = question.trim().length > 0 && question.trim().length < 20;
  const questionOk = question.trim().length >= 20;
  const dateOk =
    resolutionDate !== "" &&
    new Date(resolutionDate).getTime() > Date.now();
  const canSubmit = questionOk && dateOk;

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    const newMarket: CreatedMarket = {
      id: `custom-${Date.now()}`,
      question: question.trim(),
      category,
      initialProbability: probability,
      resolutionDate,
      resolutionCriteria: resolutionCriteria.trim(),
      createdAt: Date.now(),
    };
    const updated = [newMarket, ...createdMarkets];
    setCreatedMarkets(updated);
    saveCreatedMarkets(updated);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setQuestion("");
      setResolutionDate("");
      setResolutionCriteria("");
      setProbability(50);
      setCategory("macro");
    }, 2500);
  }, [canSubmit, question, category, probability, resolutionDate, resolutionCriteria, createdMarkets]);

  const handleDelete = useCallback((id: string) => {
    const updated = createdMarkets.filter((m) => m.id !== id);
    setCreatedMarkets(updated);
    saveCreatedMarkets(updated);
  }, [createdMarkets]);

  const handleExampleClick = useCallback((q: string) => {
    setQuestion(q);
    setShowExamples(false);
  }, []);

  // Minimum date = tomorrow
  const minDate = new Date(Date.now() + 86_400_000).toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-foreground">Create a Market</h2>
        <p className="text-[11px] text-muted-foreground">
          Propose a custom prediction question to learn how markets are designed.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-[11px] text-amber-400">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          This is simulated and for educational purposes only. Real prediction markets require
          regulatory approval and compliance in most jurisdictions.
        </span>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        {/* Question */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Market Question
            </label>
            <button
              onClick={() => setShowExamples((v) => !v)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <Lightbulb className="h-3 w-3" />
              Examples
            </button>
          </div>

          {showExamples && (
            <div className="mb-2 rounded-md border border-border bg-muted/30 p-2 space-y-1">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleExampleClick(q)}
                  className="w-full rounded px-2 py-1.5 text-left text-[11px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Will [event] happen by [date]?"
            rows={2}
            className={cn(
              "w-full resize-none rounded-md border bg-muted/20 px-3 py-2 text-[12px] text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors",
              questionTooShort
                ? "border-red-500/40 focus:border-red-500/60"
                : questionOk
                  ? "border-green-500/30 focus:border-green-500/50"
                  : "border-border focus:border-border/80",
            )}
          />
          {questionTooShort && (
            <p className="mt-0.5 text-[10px] text-red-400">
              Question should be at least 20 characters.
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Category
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCategory(opt.value)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
                  category === opt.value
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Initial probability */}
        <ProbabilityBar value={probability} onChange={setProbability} />

        {/* Resolution date */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Calendar className="mr-1 inline h-3 w-3" />
            Resolution Date
          </label>
          <input
            type="date"
            min={minDate}
            value={resolutionDate}
            onChange={(e) => setResolutionDate(e.target.value)}
            className={cn(
              "rounded-md border bg-muted/20 px-3 py-2 text-[12px] text-foreground outline-none transition-colors",
              dateOk ? "border-green-500/30" : "border-border",
            )}
          />
          {resolutionDate && !dateOk && (
            <p className="mt-0.5 text-[10px] text-red-400">
              Resolution date must be in the future.
            </p>
          )}
        </div>

        {/* Resolution criteria */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Resolution Criteria{" "}
            <span className="normal-case text-muted-foreground/60 font-normal">(optional)</span>
          </label>
          <textarea
            value={resolutionCriteria}
            onChange={(e) => setResolutionCriteria(e.target.value)}
            placeholder="Describe exactly how this market will be resolved (e.g., 'as reported by the Bureau of Labor Statistics')"
            rows={2}
            className="w-full resize-none rounded-md border border-border bg-muted/20 px-3 py-2 text-[12px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-border/80"
          />
        </div>

        {/* Submit */}
        {submitted ? (
          <div className="flex items-center gap-2 rounded-md bg-green-500/10 px-3 py-2.5 text-[12px] text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            Market created (simulated). Only visible to you locally.
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            <PlusCircle className="h-4 w-4" />
            Create Market
          </button>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-lg border border-border bg-card">
        <button
          onClick={() => setShowTips((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              What makes a good prediction market?
            </span>
          </div>
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        {showTips && (
          <div className="border-t border-border px-4 pb-4 pt-3">
            <ul className="space-y-2">
              {GOOD_QUESTION_TIPS.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-foreground/60">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Created markets */}
      {createdMarkets.length > 0 && (
        <div>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Your Created Markets ({createdMarkets.length})
          </h3>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {createdMarkets.map((m) => (
              <CreatedMarketCard
                key={m.id}
                market={m}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
