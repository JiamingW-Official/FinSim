"use client";

import { useState, useMemo, useRef } from "react";
import { Search, ChevronDown, ChevronUp, BookOpen, BarChart2, TrendingUp, Lightbulb, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { GLOSSARY, type GlossaryEntry } from "@/data/glossary";
import { INDICATOR_EXPLANATIONS } from "@/data/indicator-explanations";
import { CHART_PATTERNS } from "@/data/chart-patterns";
import { CANDLESTICK_PATTERNS } from "@/data/candlestick-patterns";
import { MARKET_WISDOM } from "@/data/market-wisdom";
import { ECONOMIC_INDICATORS } from "@/data/economic-indicators-guide";
import type { IndicatorType } from "@/stores/chart-store";

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<GlossaryEntry["category"], { label: string; color: string }> = {
  basics:            { label: "Basics",         color: "bg-primary/10 text-primary/70 border-primary/15" },
  orders:            { label: "Orders",         color: "bg-primary/10 text-primary/70 border-primary/15" },
  indicators:        { label: "Indicators",     color: "bg-teal-500/10 text-teal-400/80 border-teal-500/15" },
  risk:              { label: "Risk",           color: "bg-red-500/10 text-red-400/80 border-red-500/15" },
  fundamental:       { label: "Fundamental",   color: "bg-amber-500/10 text-amber-400/80 border-amber-500/15" },
  "personal-finance":{ label: "Personal",      color: "bg-green-500/10 text-green-400/80 border-green-500/15" },
  crypto:            { label: "Crypto",         color: "bg-orange-500/10 text-orange-400/80 border-orange-500/15" },
  macro:             { label: "Macro",          color: "bg-sky-500/10 text-sky-400/80 border-sky-500/15" },
  "options-advanced":{ label: "Options",        color: "bg-pink-500/10 text-pink-400/80 border-pink-500/15" },
  technical:         { label: "Technical",      color: "bg-cyan-500/10 text-cyan-400/80 border-cyan-500/15" },
};

const INDICATOR_FILTER_CONFIG: Record<string, string[]> = {
  All:        [],
  Trend:      ["sma20", "sma50", "ema12", "ema26", "adx", "psar"],
  Momentum:   ["rsi", "macd", "stochastic", "cci", "williams_r"],
  Volatility: ["bollinger", "atr"],
  Volume:     ["vwap", "obv"],
};

const WISDOM_CATEGORIES = ["All", "risk", "psychology", "strategy", "discipline", "market"] as const;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// ─── Shared mini-components ───────────────────────────────────────────────────

function ReliabilityDots({ score, max = 5 }: { score: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={cn(
          "inline-block h-1.5 w-1.5 rounded-full",
          i < score ? "bg-primary" : "bg-border",
        )} />
      ))}
    </div>
  );
}

function DirectionPill({ direction }: { direction: "bullish" | "bearish" | "both" }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide border",
      direction === "bullish" && "bg-emerald-500/10 text-emerald-400/80 border-emerald-500/15",
      direction === "bearish" && "bg-red-500/10 text-red-400/80 border-red-500/15",
      direction === "both"    && "bg-muted/40 text-muted-foreground/60 border-border/50",
    )}>
      {direction}
    </span>
  );
}

function TypePill({ type }: { type: "continuation" | "reversal" }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide border",
      type === "continuation"
        ? "bg-primary/10 text-primary/70 border-primary/15"
        : "bg-amber-500/10 text-amber-400/80 border-amber-500/15",
    )}>
      {type}
    </span>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/30 mb-1">{label}</p>
      <div className="text-xs text-muted-foreground/75 leading-relaxed">{children}</div>
    </div>
  );
}

// ─── SVG Pattern Illustrations ────────────────────────────────────────────────

function ChartPatternSVG({ name, direction }: { name: string; direction: "bullish" | "bearish" | "both" }) {
  const w = 80; const h = 50;
  const getPath = () => {
    const lc = name.toLowerCase();
    if (lc.includes("head and shoulders") && !lc.includes("inverse")) return (
      <polyline points="0,40 10,28 20,40 30,10 40,40 50,22 60,40 80,45" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" />
    );
    if (lc.includes("inverse head and shoulders")) return (
      <polyline points="0,10 10,22 20,10 30,40 40,10 50,28 60,10 80,5" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinejoin="round" />
    );
    if (lc.includes("double top")) return (
      <polyline points="0,40 15,12 30,30 45,12 60,40 80,45" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" />
    );
    if (lc.includes("double bottom")) return (
      <polyline points="0,10 15,38 30,20 45,38 60,10 80,5" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinejoin="round" />
    );
    if (lc.includes("triple top")) return (
      <polyline points="0,40 10,12 20,30 30,12 40,30 50,12 60,40 80,45" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" />
    );
    if (lc.includes("triple bottom")) return (
      <polyline points="0,10 10,38 20,20 30,38 40,20 50,38 60,10 80,5" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinejoin="round" />
    );
    if (lc.includes("cup and handle")) return (
      <path d="M0,10 Q20,42 40,42 Q55,42 60,28 L65,30 L68,24 L80,20" fill="none" stroke="#22c55e" strokeWidth="1.5" />
    );
    if (lc.includes("ascending triangle")) return (<>
      <line x1="0" y1="15" x2="80" y2="15" stroke="#6b7280" strokeWidth="1" strokeDasharray="3,2" />
      <polyline points="0,42 20,15 30,30 50,15 60,22 80,15" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinejoin="round" />
    </>);
    if (lc.includes("descending triangle")) return (<>
      <line x1="0" y1="38" x2="80" y2="38" stroke="#6b7280" strokeWidth="1" strokeDasharray="3,2" />
      <polyline points="0,10 20,38 30,22 50,38 60,28 80,38" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" />
    </>);
    if (lc.includes("symmetrical triangle")) return (
      <polyline points="0,8 15,35 25,18 40,30 50,20 65,28 80,25" fill="none" stroke="#a3a3a3" strokeWidth="1.5" strokeLinejoin="round" />
    );
    if (lc === "bull flag") return (<>
      <polyline points="0,42 15,10" fill="none" stroke="#22c55e" strokeWidth="1.5" />
      <polyline points="15,10 30,16 45,22 60,18 75,24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinejoin="round" />
      <polyline points="75,24 80,12" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3,2" />
    </>);
    if (lc === "bear flag") return (<>
      <polyline points="0,8 15,40" fill="none" stroke="#ef4444" strokeWidth="1.5" />
      <polyline points="15,40 30,34 45,28 60,32 75,26" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" />
      <polyline points="75,26 80,40" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,2" />
    </>);
    if (lc.includes("pennant")) {
      const color = direction === "bearish" ? "#ef4444" : "#22c55e";
      return (<>
        <line x1="0" y1="42" x2="20" y2="8" stroke={color} strokeWidth="1.5" />
        <polyline points="20,8 35,18 45,14 55,20 65,17" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <polyline points="65,17 80,10" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3,2" />
      </>);
    }
    if (direction === "bullish") return (
      <polyline points="0,40 20,32 35,36 55,18 70,22 80,8" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinejoin="round" />
    );
    return (
      <polyline points="0,10 20,18 35,14 55,32 70,28 80,42" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" />
    );
  };
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="block" aria-hidden="true">
      {getPath()}
    </svg>
  );
}

// ─── Custom filter pills ───────────────────────────────────────────────────────

function FilterPills<T extends string>({
  options, active, onChange,
}: { options: readonly T[]; active: T; onChange: (v: T) => void }) {
  return (
    <div className="flex items-center gap-0.5 border border-border/70 rounded-lg p-0.5 w-fit flex-wrap">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "px-3 py-1 text-[11px] font-medium rounded-md transition-colors capitalize",
            active === opt
              ? "bg-foreground text-background font-semibold"
              : "text-muted-foreground/45 hover:text-foreground/70",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Tab 1: Dictionary ────────────────────────────────────────────────────────

function DictionaryTab() {
  const [search, setSearch] = useState("");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const filtered = useMemo(() => {
    if (!search.trim()) return GLOSSARY;
    const q = search.toLowerCase();
    return GLOSSARY.filter(
      (e) => e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q) || (e.example ?? "").toLowerCase().includes(q),
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map: Record<string, GlossaryEntry[]> = {};
    for (const entry of filtered) {
      const letter = entry.term[0].toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(entry);
    }
    return map;
  }, [filtered]);

  const presentLetters = new Set(Object.keys(grouped));
  const scrollTo = (letter: string) => sectionRefs.current[letter]?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="flex flex-col gap-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/35" />
        <input
          placeholder="Search terms, definitions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-border/70 bg-transparent pl-9 pr-3 py-2.5 text-xs rounded-lg focus:outline-none focus:border-foreground/30 placeholder:text-muted-foreground/25 transition-colors"
        />
      </div>

      {/* Alphabet jump bar */}
      {!search.trim() && (
        <div className="flex flex-wrap gap-0.5">
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => scrollTo(letter)}
              disabled={!presentLetters.has(letter)}
              className={cn(
                "h-6 w-6 rounded text-[11px] font-mono font-medium transition-colors",
                presentLetters.has(letter)
                  ? "text-foreground/70 hover:bg-foreground/10 cursor-pointer"
                  : "text-muted-foreground/15 cursor-default",
              )}
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      {/* Count */}
      <p className="text-[10px] font-mono text-muted-foreground/30 tracking-wide">
        {filtered.length} {filtered.length === 1 ? "term" : "terms"}
        {search.trim() ? ` for "${search}"` : ""}
      </p>

      {/* Grouped sections */}
      <div className="flex flex-col gap-6">
        {Object.keys(grouped).sort().map((letter) => (
          <div key={letter} ref={(el) => { sectionRefs.current[letter] = el; }}>
            {/* Letter anchor */}
            <div className="flex items-center gap-3 mb-3">
              <span className="font-serif text-2xl font-bold text-foreground/12 select-none leading-none w-6">
                {letter}
              </span>
              <div className="h-px flex-1 bg-border/40" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {grouped[letter].map((entry) => {
                const cat = CATEGORY_CONFIG[entry.category];
                return (
                  <div key={entry.term} className="rounded-xl border border-border/60 bg-card p-3.5 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground leading-tight">{entry.term}</span>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide border", cat.color)}>
                        {cat.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground/65 leading-relaxed">{entry.definition}</p>
                    {entry.example && (
                      <p className="text-[11px] text-muted-foreground/45 italic border-l-2 border-foreground/10 pl-2.5 leading-relaxed">
                        {entry.example}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {Object.keys(grouped).length === 0 && (
          <div className="py-12 text-center">
            <p className="font-serif text-2xl font-bold text-foreground/10 mb-1">No terms found</p>
            <p className="text-xs text-muted-foreground/30">Try a different search</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab 2: Indicators ────────────────────────────────────────────────────────

function IndicatorsTab() {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const allKeys = Object.keys(INDICATOR_EXPLANATIONS) as IndicatorType[];
  const filtered = useMemo(() => {
    const keys = INDICATOR_FILTER_CONFIG[filter];
    if (!keys || keys.length === 0) return allKeys;
    return allKeys.filter((k) => keys.includes(k));
  }, [filter, allKeys]);

  return (
    <div className="flex flex-col gap-5">
      <FilterPills
        options={Object.keys(INDICATOR_FILTER_CONFIG) as string[]}
        active={filter}
        onChange={setFilter}
      />
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((key) => {
          const info = INDICATOR_EXPLANATIONS[key];
          const isOpen = expanded === key;
          return (
            <div key={key} className={cn(
              "rounded-xl border overflow-hidden transition-colors",
              isOpen ? "border-foreground/20 bg-foreground/[0.03]" : "border-border/60 bg-card",
            )}>
              <button
                type="button"
                className="w-full text-left px-4 py-3.5 flex items-start justify-between gap-2"
                onClick={() => setExpanded(isOpen ? null : key)}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-foreground leading-tight">{info.name}</span>
                  <span className="text-[11px] text-muted-foreground/45 leading-tight">{info.shortDesc}</span>
                </div>
                {isOpen
                  ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
                  : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />}
              </button>

              {isOpen && (
                <div className="border-t border-border/40 px-4 py-4 flex flex-col gap-3.5">
                  <InfoRow label="How to read">{info.howToRead}</InfoRow>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.05] px-3 py-2.5">
                      <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-emerald-400/70 mb-1">Bull signal</p>
                      <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{info.bullSignal}</p>
                    </div>
                    <div className="rounded-lg border border-red-500/15 bg-red-500/[0.05] px-3 py-2.5">
                      <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-red-400/70 mb-1">Bear signal</p>
                      <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{info.bearSignal}</p>
                    </div>
                  </div>
                  <InfoRow label="Best for">{info.bestFor}</InfoRow>
                  <div className="rounded-lg border border-amber-500/15 bg-amber-500/[0.05] px-3 py-2.5">
                    <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-amber-400/70 mb-1">Common mistake</p>
                    <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{info.commonMistakes}</p>
                  </div>
                  <div className="rounded-lg border border-primary/15 bg-primary/[0.05] px-3 py-2.5">
                    <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary/70 mb-1">Pro tip</p>
                    <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{info.proTip}</p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
                    <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/30 mb-1">Example</p>
                    <p className="text-[11px] text-muted-foreground/60 italic leading-relaxed">{info.exampleScenario}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab 3: Chart Patterns ────────────────────────────────────────────────────

function ChartPatternsTab() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const filtered = useMemo(() => {
    if (!search.trim()) return CHART_PATTERNS;
    const q = search.toLowerCase();
    return CHART_PATTERNS.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/35" />
        <input
          placeholder="Search patterns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-border/70 bg-transparent pl-9 pr-3 py-2.5 text-xs rounded-lg focus:outline-none focus:border-foreground/30 placeholder:text-muted-foreground/25 transition-colors"
        />
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((pattern) => {
          const isOpen = expanded === pattern.name;
          return (
            <div key={pattern.name} className={cn(
              "rounded-xl border overflow-hidden transition-colors",
              isOpen ? "border-foreground/20 bg-foreground/[0.03]" : "border-border/60 bg-card",
            )}>
              <button
                type="button"
                className="w-full text-left px-4 pt-3.5 pb-3"
                onClick={() => setExpanded(isOpen ? null : pattern.name)}
              >
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <span className="text-sm font-semibold text-foreground leading-tight">{pattern.name}</span>
                  {isOpen
                    ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
                    : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />}
                </div>
                <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                  <TypePill type={pattern.type} />
                  <DirectionPill direction={pattern.direction} />
                  <div className="flex items-center gap-1 ml-auto">
                    <ReliabilityDots score={pattern.reliability} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-muted/20 border border-border/30 px-2 py-1.5">
                    <ChartPatternSVG name={pattern.name} direction={pattern.direction} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground/30">Timeframe</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">{pattern.timeframe.split(".")[0]}</p>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border/40 px-4 py-4 flex flex-col gap-3.5">
                  <InfoRow label="Description">{pattern.description}</InfoRow>
                  <InfoRow label="Psychology">{pattern.psychology}</InfoRow>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/30 mb-2">How to identify</p>
                    <ul className="space-y-1.5">
                      {pattern.howToIdentify.map((step, i) => (
                        <li key={i} className="flex gap-2 text-xs text-muted-foreground/65">
                          <span className="text-primary/60 shrink-0 font-mono font-bold">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["entry", "stopLoss", "target"] as const).map((field) => (
                      <div key={field} className="rounded-lg border border-border/40 bg-muted/15 px-2.5 py-2">
                        <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground/30 mb-0.5">
                          {field === "stopLoss" ? "Stop" : field}
                        </p>
                        <p className="text-[11px] text-muted-foreground/65 leading-snug">{pattern.tradeSetup[field]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="font-serif text-2xl font-bold text-foreground/10 mb-1">No patterns found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab 4: Candlestick Patterns ──────────────────────────────────────────────

function CandlestickPatternsTab() {
  const [filter, setFilter] = useState<"All" | "bullish" | "bearish" | "neutral">("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const filtered = useMemo(() => {
    if (filter === "All") return CANDLESTICK_PATTERNS;
    return CANDLESTICK_PATTERNS.filter((p) => p.type === filter);
  }, [filter]);

  return (
    <div className="flex flex-col gap-5">
      <FilterPills
        options={["All", "bullish", "bearish", "neutral"] as const}
        active={filter}
        onChange={setFilter}
      />
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((pattern) => {
          const isOpen = expanded === pattern.name;
          const typeColor =
            pattern.type === "bullish" ? "bg-emerald-500/10 text-emerald-400/80 border-emerald-500/15"
            : pattern.type === "bearish" ? "bg-red-500/10 text-red-400/80 border-red-500/15"
            : "bg-muted/30 text-muted-foreground/50 border-border/40";

          return (
            <div key={pattern.name} className={cn(
              "rounded-xl border overflow-hidden transition-colors",
              isOpen ? "border-foreground/20 bg-foreground/[0.03]" : "border-border/60 bg-card",
            )}>
              <button
                type="button"
                className="w-full text-left px-4 pt-3.5 pb-3"
                onClick={() => setExpanded(isOpen ? null : pattern.name)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight">{pattern.name}</p>
                    <p className="text-[11px] text-muted-foreground/35 font-mono mt-0.5">{pattern.japaneseName}</p>
                  </div>
                  {isOpen
                    ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                    : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />}
                </div>
                <div className="flex items-center gap-1.5 mb-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide border", typeColor)}>
                    {pattern.type}
                  </span>
                  <div className="flex items-center gap-1 ml-auto">
                    <ReliabilityDots score={pattern.reliability} />
                  </div>
                </div>
                <div className="flex items-center justify-center rounded-lg bg-muted/20 border border-border/30 py-2">
                  <svg viewBox="0 0 50 50" width={50} height={50} className="block" aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: pattern.svg }} />
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border/40 px-4 py-4 flex flex-col gap-3.5">
                  <InfoRow label="Description">{pattern.description}</InfoRow>
                  <InfoRow label="Psychology">{pattern.psychology}</InfoRow>
                  <InfoRow label="How to trade">{pattern.howToTrade}</InfoRow>
                  <div className="rounded-lg border border-primary/15 bg-primary/[0.05] px-3 py-2.5">
                    <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary/70 mb-1">Confirmation needed</p>
                    <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{pattern.confirmation}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab 5: Market Wisdom ─────────────────────────────────────────────────────

function MarketWisdomTab() {
  const [filter, setFilter] = useState<string>("All");
  const filtered = useMemo(() => {
    if (filter === "All") return MARKET_WISDOM;
    return MARKET_WISDOM.filter((w) => w.category === filter);
  }, [filter]);

  const catColor: Record<string, string> = {
    risk:        "bg-red-500/10 text-red-400/80 border-red-500/15",
    psychology:  "bg-primary/10 text-primary/70 border-primary/15",
    strategy:    "bg-primary/10 text-primary/70 border-primary/15",
    discipline:  "bg-amber-500/10 text-amber-400/80 border-amber-500/15",
    market:      "bg-teal-500/10 text-teal-400/80 border-teal-500/15",
  };

  return (
    <div className="flex flex-col gap-5">
      <FilterPills
        options={WISDOM_CATEGORIES}
        active={filter}
        onChange={setFilter}
      />
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((wisdom, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card p-4 flex flex-col gap-3">
            {/* Quote */}
            <p className="font-serif text-base font-bold text-foreground/80 leading-snug italic">
              &ldquo;{wisdom.quote}&rdquo;
            </p>
            <p className="text-[11px] font-mono text-primary/60">— {wisdom.author}</p>
            <div className="pt-3 border-t border-border/40 flex flex-col gap-2">
              <span className={cn("w-fit rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide border", catColor[wisdom.category] ?? "bg-muted/30 text-muted-foreground/50 border-border/40")}>
                {wisdom.category}
              </span>
              <p className="text-xs text-muted-foreground/55 leading-relaxed">{wisdom.lesson}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab 6: Economic Indicators ───────────────────────────────────────────────

function EconomicIndicatorsTab() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const freqColor = (f: string) =>
    f === "weekly"  ? "bg-emerald-500/10 text-emerald-400/80 border-emerald-500/15"
    : f === "monthly" ? "bg-primary/10 text-primary/70 border-primary/15"
    : "bg-amber-500/10 text-amber-400/80 border-amber-500/15";

  const leadColor = (l: string) =>
    l === "leading"    ? "bg-primary/10 text-primary/70 border-primary/15"
    : l === "coincident" ? "bg-teal-500/10 text-teal-400/80 border-teal-500/15"
    : "bg-muted/30 text-muted-foreground/50 border-border/40";

  return (
    <div className="flex flex-col gap-2.5">
      {ECONOMIC_INDICATORS.map((ind) => {
        const isOpen = expanded === ind.name;
        return (
          <div key={ind.name} className={cn(
            "rounded-xl border overflow-hidden transition-colors",
            isOpen ? "border-foreground/20 bg-foreground/[0.03]" : "border-border/60 bg-card",
          )}>
            <button
              type="button"
              className="w-full text-left px-4 py-3.5 flex items-start justify-between gap-3"
              onClick={() => setExpanded(isOpen ? null : ind.name)}
            >
              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <span className="text-sm font-semibold text-foreground leading-tight">{ind.name}</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide border", freqColor(ind.frequency))}>
                    {ind.frequency}
                  </span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide border", leadColor(ind.leadingOrLagging))}>
                    {ind.leadingOrLagging}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground/30">{ind.source}</span>
                </div>
                <p className="text-xs text-muted-foreground/50 line-clamp-1 leading-relaxed">{ind.whatItMeasures}</p>
              </div>
              {isOpen
                ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
                : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />}
            </button>

            {isOpen && (
              <div className="border-t border-border/40 px-4 py-4 flex flex-col gap-3.5">
                <InfoRow label="Why it matters">{ind.whyItMatters}</InfoRow>
                <InfoRow label="How to read it">{ind.howToRead}</InfoRow>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/30 mb-2">Market impact</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(["stocks", "bonds", "forex"] as const).map((asset) => (
                      <div key={asset} className="rounded-lg border border-border/40 bg-muted/15 px-2.5 py-2">
                        <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground/30 mb-0.5">{asset}</p>
                        <p className="text-[11px] text-muted-foreground/60 leading-snug">{ind.marketImpact[asset]}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {ind.relatedIndicators.length > 0 && (
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/30 mb-2">Related</p>
                    <div className="flex flex-wrap gap-1">
                      {ind.relatedIndicators.map((r) => (
                        <span key={r} className="rounded-full border border-border/50 bg-muted/20 px-2 py-0.5 text-[10px] font-mono text-muted-foreground/45">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

const TABS = [
  { value: "dictionary",     label: "Dictionary",    icon: BookOpen },
  { value: "indicators",     label: "Indicators",    icon: BarChart2 },
  { value: "chart-patterns", label: "Patterns",      icon: TrendingUp },
  { value: "candlesticks",   label: "Candles",       icon: BarChart2 },
  { value: "wisdom",         label: "Wisdom",        icon: Lightbulb },
  { value: "economics",      label: "Economics",     icon: Globe },
] as const;

type TabValue = typeof TABS[number]["value"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GlossaryPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("dictionary");

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Header ── */}
      <div className="border-b border-border px-5 pt-5 pb-4 shrink-0">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/25 mb-2">
          Reference
        </p>
        <h1 className="font-serif text-3xl font-bold tracking-tight leading-none text-foreground">
          Education <span className="font-light text-muted-foreground/35">Hub</span>
        </h1>
        <p className="text-xs text-muted-foreground/40 mt-2 leading-relaxed">
          Glossary · Indicators · Patterns · Market wisdom · Economics
        </p>

        {/* Custom tab bar */}
        <div className="flex items-center gap-0.5 mt-5 border-b border-border/0">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium transition-all border-b-2 -mb-px",
                activeTab === tab.value
                  ? "border-foreground text-foreground font-semibold"
                  : "border-transparent text-muted-foreground/45 hover:text-foreground/60 hover:border-border",
              )}
            >
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-5 py-6">
          {activeTab === "dictionary"     && <DictionaryTab />}
          {activeTab === "indicators"     && <IndicatorsTab />}
          {activeTab === "chart-patterns" && <ChartPatternsTab />}
          {activeTab === "candlesticks"   && <CandlestickPatternsTab />}
          {activeTab === "wisdom"         && <MarketWisdomTab />}
          {activeTab === "economics"      && <EconomicIndicatorsTab />}
        </div>
      </div>
    </div>
  );
}
