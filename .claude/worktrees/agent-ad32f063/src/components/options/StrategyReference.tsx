"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  AlertTriangle,
  Target,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import {
  OPTIONS_STRATEGIES,
  SENTIMENT_OPTIONS,
  type OptionsStrategy,
  type MarketSentiment,
} from "@/data/options-strategies";

// ─── Risk stars ───────────────────────────────────────────────────────────────
function RiskStars({ level }: { level: number }) {
  const colors = [
    "text-emerald-400",
    "text-emerald-400",
    "text-amber-400",
    "text-orange-400",
    "text-red-400",
  ];
  const color = colors[level - 1] ?? "text-muted-foreground";
  return (
    <div className={`flex items-center gap-0.5 text-[10px] ${color}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < level ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

// ─── Sentiment tag ────────────────────────────────────────────────────────────
const SENTIMENT_COLORS: Record<MarketSentiment, string> = {
  bullish: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  bearish: "bg-red-500/10 text-red-400 border-red-500/20",
  neutral: "bg-muted text-muted-foreground border-border",
  volatile: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  calm: "bg-sky-500/10 text-sky-400 border-sky-500/20",
};

function SentimentTag({ s }: { s: MarketSentiment }) {
  return (
    <span
      className={`rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize ${SENTIMENT_COLORS[s]}`}
    >
      {s}
    </span>
  );
}

// ─── Greeks pill ─────────────────────────────────────────────────────────────
const GREEK_COLORS = {
  positive: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  negative: "bg-red-500/10 text-red-400 border-red-500/20",
  neutral: "bg-muted text-muted-foreground border-border",
  varies: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const GREEK_SYMBOLS: Record<string, string> = {
  Delta: "\u0394",
  Gamma: "\u0393",
  Theta: "\u0398",
  Vega: "V",
};

function GreekChip({ label, value }: { label: string; value: string }) {
  const color = GREEK_COLORS[value as keyof typeof GREEK_COLORS] ?? GREEK_COLORS.neutral;
  const sign = value === "positive" ? "+" : value === "negative" ? "\u2212" : "~";
  return (
    <div className={`rounded border px-1.5 py-0.5 text-center ${color}`}>
      <span className="text-[9px] font-semibold">
        {GREEK_SYMBOLS[label] ?? label}
        {sign}
      </span>
    </div>
  );
}

function GreekPill({ label, value }: { label: string; value: string }) {
  const color = GREEK_COLORS[value as keyof typeof GREEK_COLORS] ?? GREEK_COLORS.neutral;
  return (
    <div className={`rounded border px-2 py-1 text-center ${color}`}>
      <div className="text-[9px] font-medium uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-xs font-semibold capitalize">{value}</div>
    </div>
  );
}

// ─── Category badge ───────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<OptionsStrategy["category"], string> = {
  basic: "bg-primary/10 text-primary border-primary/20",
  spread: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  income: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  complex: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  synthetic: "bg-sky-500/10 text-sky-400 border-sky-500/20",
};

function CategoryBadge({ category }: { category: OptionsStrategy["category"] }) {
  const color = CATEGORY_COLORS[category];
  return (
    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize ${color}`}>
      {category}
    </span>
  );
}

// ─── Experience badge ─────────────────────────────────────────────────────────
const EXP_COLORS = {
  beginner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
};

function ExperienceBadge({ level }: { level: OptionsStrategy["experienceLevel"] }) {
  return (
    <span
      className={`rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize ${EXP_COLORS[level]}`}
    >
      {level}
    </span>
  );
}

// ─── Capital tag ──────────────────────────────────────────────────────────────
const CAPITAL_COLORS = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-red-400",
};

function CapitalTag({ level }: { level: OptionsStrategy["capitalRequired"] }) {
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-medium ${CAPITAL_COLORS[level]}`}>
      <DollarSign className="h-2.5 w-2.5" />
      {level === "low" ? "Low capital" : level === "medium" ? "Med. capital" : "High capital"}
    </span>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </div>
  );
}

// ─── Strategy card ────────────────────────────────────────────────────────────
function StrategyCard({
  strategy,
  onClick,
}: {
  strategy: OptionsStrategy;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="w-full rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent/40"
    >
      {/* Header row */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground">{strategy.name}</span>
            <CategoryBadge category={strategy.category} />
            <ExperienceBadge level={strategy.experienceLevel} />
          </div>
          <div className="mt-1 flex items-center gap-2">
            <RiskStars level={strategy.riskLevel} />
            <CapitalTag level={strategy.capitalRequired} />
          </div>
        </div>
        <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </div>

      {/* Sentiment tags */}
      <div className="mb-2 flex flex-wrap gap-1">
        {strategy.sentiment.map((s) => (
          <SentimentTag key={s} s={s} />
        ))}
      </div>

      {/* Greeks chips */}
      <div className="mb-2 flex gap-1">
        <GreekChip label="Delta" value={strategy.greeksProfile.delta} />
        <GreekChip label="Gamma" value={strategy.greeksProfile.gamma} />
        <GreekChip label="Theta" value={strategy.greeksProfile.theta} />
        <GreekChip label="Vega" value={strategy.greeksProfile.vega} />
      </div>

      {/* Max profit / Max loss */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded bg-emerald-500/5 px-2 py-1">
          <div className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            Max Profit
          </div>
          <div className="truncate text-xs font-medium text-emerald-400">
            {strategy.maxProfit}
          </div>
        </div>
        <div className="rounded bg-red-500/5 px-2 py-1">
          <div className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            Max Loss
          </div>
          <div className="truncate text-xs font-medium text-red-400">{strategy.maxLoss}</div>
        </div>
      </div>

      {/* Setup conditions preview */}
      <p className="mt-2 line-clamp-1 text-[10px] text-muted-foreground">{strategy.setup}</p>
    </motion.button>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────
function StrategyDetail({
  strategy,
  onBack,
}: {
  strategy: OptionsStrategy;
  onBack: () => void;
}) {
  const [showMistakes, setShowMistakes] = useState(false);

  return (
    <motion.div
      key={strategy.id}
      initial={{ x: 32, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 32, opacity: 0 }}
      transition={{ type: "spring", damping: 22, stiffness: 300 }}
      className="flex h-full flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-3">
        <button
          onClick={onBack}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          <span className="text-sm font-semibold">{strategy.name}</span>
          <CategoryBadge category={strategy.category} />
          <ExperienceBadge level={strategy.experienceLevel} />
        </div>
        <RiskStars level={strategy.riskLevel} />
      </div>

      {/* Scrollable body */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-1.5">
          {strategy.sentiment.map((s) => (
            <SentimentTag key={s} s={s} />
          ))}
          <span className="text-muted-foreground">&middot;</span>
          <CapitalTag level={strategy.capitalRequired} />
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-muted-foreground">{strategy.description}</p>

        {/* Construction */}
        <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
          <SectionLabel>Construction</SectionLabel>
          <p className="font-mono text-xs leading-relaxed text-foreground">
            {strategy.construction}
          </p>
        </div>

        {/* Profit / Loss / Breakeven */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2">
            <div className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
              Max Profit
            </div>
            <div className="mt-0.5 text-xs font-semibold text-emerald-400">
              {strategy.maxProfit}
            </div>
          </div>
          <div className="rounded-md border border-red-500/20 bg-red-500/5 p-2">
            <div className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
              Max Loss
            </div>
            <div className="mt-0.5 text-xs font-semibold text-red-400">{strategy.maxLoss}</div>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-2">
            <div className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
              Breakeven
            </div>
            <div className="mt-0.5 text-xs font-semibold text-foreground">
              {strategy.breakeven}
            </div>
          </div>
        </div>

        {/* Greeks profile */}
        <div>
          <SectionLabel>Greeks Profile</SectionLabel>
          <div className="grid grid-cols-4 gap-1.5">
            <GreekPill label="Delta" value={strategy.greeksProfile.delta} />
            <GreekPill label="Gamma" value={strategy.greeksProfile.gamma} />
            <GreekPill label="Theta" value={strategy.greeksProfile.theta} />
            <GreekPill label="Vega" value={strategy.greeksProfile.vega} />
          </div>
        </div>

        {/* Ideal setup */}
        <div>
          <SectionLabel>Ideal Setup</SectionLabel>
          <p className="text-xs leading-relaxed text-muted-foreground">{strategy.setup}</p>
        </div>

        {/* When to enter */}
        <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Target className="h-3 w-3 text-primary" />
            <SectionLabel>When to Enter</SectionLabel>
          </div>
          <p className="text-xs leading-relaxed text-foreground">{strategy.whenToUse}</p>
        </div>

        {/* Market conditions */}
        <div>
          <SectionLabel>Market Conditions</SectionLabel>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {strategy.idealConditions}
          </p>
        </div>

        {/* Key risks */}
        <div>
          <SectionLabel>Key Risks</SectionLabel>
          <p className="text-xs leading-relaxed text-muted-foreground">{strategy.risks}</p>
        </div>

        {/* Example P&L */}
        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
          <div className="mb-1.5 flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            <SectionLabel>Example P&L Scenario</SectionLabel>
          </div>
          <p className="text-xs leading-relaxed text-foreground">{strategy.examplePnL}</p>
        </div>

        {/* Common mistakes — expandable */}
        <div>
          <button
            onClick={() => setShowMistakes((v) => !v)}
            className="flex w-full items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-left hover:bg-amber-500/10"
          >
            <AlertTriangle className="h-3 w-3 shrink-0 text-amber-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-400">
              Common Mistakes
            </span>
            <span className="ml-auto text-[10px] text-muted-foreground">
              {showMistakes ? "\u25b2 hide" : "\u25bc show"}
            </span>
          </button>
          <AnimatePresence>
            {showMistakes && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="rounded-b-md border border-t-0 border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
                  <p className="text-xs leading-relaxed text-foreground">
                    {strategy.commonMistakes}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Real-world example */}
        <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5">
          <div className="mb-1.5 flex items-center gap-1.5">
            <BookOpen className="h-3 w-3 text-primary" />
            <SectionLabel>Real-World Example</SectionLabel>
          </div>
          <p className="text-xs leading-relaxed text-foreground">{strategy.realWorldExample}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Filter types ─────────────────────────────────────────────────────────────
type RiskFilter = 1 | 2 | 3 | 4 | 5 | "all";
type CapitalFilter = "low" | "medium" | "high" | "all";
type ExperienceFilter = "beginner" | "intermediate" | "advanced" | "all";

// ─── Main component ───────────────────────────────────────────────────────────
export function StrategyReference() {
  const [search, setSearch] = useState("");
  const [filterSentiment, setFilterSentiment] = useState<MarketSentiment | "all">("all");
  const [filterRisk, setFilterRisk] = useState<RiskFilter>("all");
  const [filterCapital, setFilterCapital] = useState<CapitalFilter>("all");
  const [filterExperience, setFilterExperience] = useState<ExperienceFilter>("all");
  const [selectedStrategy, setSelectedStrategy] = useState<OptionsStrategy | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return OPTIONS_STRATEGIES.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) {
        return false;
      }
      if (filterSentiment !== "all" && !s.sentiment.includes(filterSentiment)) return false;
      if (filterRisk !== "all" && s.riskLevel !== filterRisk) return false;
      if (filterCapital !== "all" && s.capitalRequired !== filterCapital) return false;
      if (filterExperience !== "all" && s.experienceLevel !== filterExperience) return false;
      return true;
    });
  }, [search, filterSentiment, filterRisk, filterCapital, filterExperience]);

  const hasActiveFilters =
    filterSentiment !== "all" ||
    filterRisk !== "all" ||
    filterCapital !== "all" ||
    filterExperience !== "all" ||
    search !== "";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {selectedStrategy ? (
          <StrategyDetail
            key="detail"
            strategy={selectedStrategy}
            onBack={() => setSelectedStrategy(null)}
          />
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex h-full flex-col overflow-hidden"
          >
            {/* Filter bar */}
            <div className="shrink-0 space-y-2 border-b border-border bg-card px-3 py-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search strategies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-7 w-full rounded-md border border-border bg-background pl-8 pr-8 text-xs outline-none placeholder:text-muted-foreground focus:border-primary"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Sentiment filter */}
              <div className="flex flex-wrap items-center gap-1">
                {SENTIMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilterSentiment(opt.value)}
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors ${
                      filterSentiment === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Risk level filter */}
              <div className="flex items-center gap-1">
                <span className="mr-1 text-[10px] text-muted-foreground">Risk:</span>
                {(["all", 1, 2, 3, 4, 5] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setFilterRisk(d)}
                    className={`rounded border px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                      filterRisk === d
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d === "all" ? "All" : `${d}\u2605`}
                  </button>
                ))}
              </div>

              {/* Capital + Experience filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">Capital:</span>
                  {(["all", "low", "medium", "high"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setFilterCapital(c)}
                      className={`rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize transition-colors ${
                        filterCapital === c
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {c === "all" ? "All" : c}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">Level:</span>
                  {(["all", "beginner", "intermediate", "advanced"] as const).map((e) => (
                    <button
                      key={e}
                      onClick={() => setFilterExperience(e)}
                      className={`rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize transition-colors ${
                        filterExperience === e
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {e === "all"
                        ? "All"
                        : e === "beginner"
                          ? "Beginner"
                          : e === "intermediate"
                            ? "Inter."
                            : "Adv."}
                    </button>
                  ))}
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setFilterSentiment("all");
                      setFilterRisk("all");
                      setFilterCapital("all");
                      setFilterExperience("all");
                    }}
                    className="ml-auto flex items-center gap-0.5 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-2.5 w-2.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Results count */}
            <div className="shrink-0 px-3 py-1.5">
              <span className="text-[10px] text-muted-foreground">
                {filtered.length} strateg{filtered.length === 1 ? "y" : "ies"}
              </span>
            </div>

            {/* Strategy grid */}
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Search className="mb-3 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">No strategies found</p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    Try adjusting your filters
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {filtered.map((strategy) => (
                    <StrategyCard
                      key={strategy.id}
                      strategy={strategy}
                      onClick={() => setSelectedStrategy(strategy)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
