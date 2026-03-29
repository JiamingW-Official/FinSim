"use client";

import { useState, useMemo, useRef } from "react";
import { Search, ChevronDown, ChevronUp, BookOpen, BarChart2, TrendingUp, Lightbulb, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { GLOSSARY, type GlossaryEntry } from "@/data/glossary";
import { INDICATOR_EXPLANATIONS } from "@/data/indicator-explanations";
import { CHART_PATTERNS } from "@/data/chart-patterns";
import { CANDLESTICK_PATTERNS } from "@/data/candlestick-patterns";
import { MARKET_WISDOM } from "@/data/market-wisdom";
import { ECONOMIC_INDICATORS } from "@/data/economic-indicators-guide";
import type { IndicatorType } from "@/stores/chart-store";

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  GlossaryEntry["category"],
  { label: string; color: string }
> = {
  basics: { label: "Basics", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  orders: { label: "Orders", color: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
  indicators: { label: "Indicators", color: "bg-teal-500/15 text-teal-400 border-teal-500/20" },
  risk: { label: "Risk", color: "bg-red-500/15 text-red-400 border-red-500/20" },
  fundamental: { label: "Fundamental", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  "personal-finance": { label: "Personal Finance", color: "bg-green-500/15 text-green-400 border-green-500/20" },
  crypto: { label: "Crypto", color: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
  macro: { label: "Macro", color: "bg-sky-500/15 text-sky-400 border-sky-500/20" },
  "options-advanced": { label: "Options", color: "bg-pink-500/15 text-pink-400 border-pink-500/20" },
  technical: { label: "Technical", color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20" },
};

const INDICATOR_FILTER_CONFIG: Record<string, string[]> = {
  All: [],
  Trend: ["sma20", "sma50", "ema12", "ema26", "adx", "psar"],
  Momentum: ["rsi", "macd", "stochastic", "cci", "williams_r"],
  Volatility: ["bollinger", "atr"],
  Volume: ["vwap", "obv"],
};

const WISDOM_CATEGORIES = ["All", "risk", "psychology", "strategy", "discipline", "market"] as const;

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// ─── Helper components ────────────────────────────────────────────────────────

function ReliabilityDots({ score, max = 5 }: { score: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "inline-block h-1.5 w-1.5 rounded-full",
            i < score ? "bg-primary" : "bg-muted-foreground/25"
          )}
        />
      ))}
    </div>
  );
}

function DirectionBadge({ direction }: { direction: "bullish" | "bearish" | "both" }) {
  if (direction === "bullish")
    return <Badge className="bg-green-500/15 text-green-400 border-green-500/20 text-xs">Bullish</Badge>;
  if (direction === "bearish")
    return <Badge className="bg-red-500/15 text-red-400 border-red-500/20 text-xs">Bearish</Badge>;
  return <Badge className="bg-muted-foreground/15 text-muted-foreground border-muted-foreground/20 text-xs">Both</Badge>;
}

function TypeBadge({ type }: { type: "continuation" | "reversal" }) {
  return (
    <Badge
      className={cn(
        "text-xs",
        type === "continuation"
          ? "bg-blue-500/15 text-blue-400 border-blue-500/20"
          : "bg-amber-500/15 text-amber-400 border-amber-500/20"
      )}
    >
      {type === "continuation" ? "Continuation" : "Reversal"}
    </Badge>
  );
}

// ─── SVG Pattern Illustrations ────────────────────────────────────────────────

function ChartPatternSVG({ name, direction }: { name: string; direction: "bullish" | "bearish" | "both" }) {
  const w = 80;
  const h = 50;

  const getPath = () => {
    const lc = name.toLowerCase();

    if (lc.includes("head and shoulders") && !lc.includes("inverse")) {
      // Three peaks, middle tallest — bearish
      return (
        <polyline
          points="0,40 10,28 20,40 30,10 40,40 50,22 60,40 80,45"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      );
    }
    if (lc.includes("inverse head and shoulders")) {
      return (
        <polyline
          points="0,10 10,22 20,10 30,40 40,10 50,28 60,10 80,5"
          fill="none"
          stroke="#22c55e"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      );
    }
    if (lc.includes("double top")) {
      return (
        <polyline
          points="0,40 15,12 30,30 45,12 60,40 80,45"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      );
    }
    if (lc.includes("double bottom")) {
      return (
        <polyline
          points="0,10 15,38 30,20 45,38 60,10 80,5"
          fill="none"
          stroke="#22c55e"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      );
    }
    if (lc.includes("triple top")) {
      return (
        <polyline
          points="0,40 10,12 20,30 30,12 40,30 50,12 60,40 80,45"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      );
    }
    if (lc.includes("triple bottom")) {
      return (
        <polyline
          points="0,10 10,38 20,20 30,38 40,20 50,38 60,10 80,5"
          fill="none"
          stroke="#22c55e"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      );
    }
    if (lc.includes("cup and handle")) {
      return (
        <>
          <path
            d="M0,10 Q20,42 40,42 Q55,42 60,28 L65,30 L68,24 L80,20"
            fill="none"
            stroke="#22c55e"
            strokeWidth="1.5"
          />
        </>
      );
    }
    if (lc.includes("ascending triangle")) {
      return (
        <>
          <line x1="0" y1="15" x2="80" y2="15" stroke="#6b7280" strokeWidth="1" strokeDasharray="3,2" />
          <polyline
            points="0,42 20,15 30,30 50,15 60,22 80,15"
            fill="none"
            stroke="#22c55e"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </>
      );
    }
    if (lc.includes("descending triangle")) {
      return (
        <>
          <line x1="0" y1="38" x2="80" y2="38" stroke="#6b7280" strokeWidth="1" strokeDasharray="3,2" />
          <polyline
            points="0,10 20,38 30,22 50,38 60,28 80,38"
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </>
      );
    }
    if (lc.includes("symmetrical triangle")) {
      return (
        <polyline
          points="0,8 15,35 25,18 40,30 50,20 65,28 80,25"
          fill="none"
          stroke="#a3a3a3"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      );
    }
    if (lc === "bull flag") {
      return (
        <>
          <polyline points="0,42 15,10" fill="none" stroke="#22c55e" strokeWidth="1.5" />
          <polyline
            points="15,10 30,16 45,22 60,18 75,24"
            fill="none"
            stroke="#22c55e"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <polyline points="75,24 80,12" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3,2" />
        </>
      );
    }
    if (lc === "bear flag") {
      return (
        <>
          <polyline points="0,8 15,40" fill="none" stroke="#ef4444" strokeWidth="1.5" />
          <polyline
            points="15,40 30,34 45,28 60,32 75,26"
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <polyline points="75,26 80,40" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,2" />
        </>
      );
    }
    if (lc.includes("pennant")) {
      const color = direction === "bearish" ? "#ef4444" : "#22c55e";
      return (
        <>
          <line x1="0" y1="42" x2="20" y2="8" stroke={color} strokeWidth="1.5" />
          <polyline
            points="20,8 35,18 45,14 55,20 65,17"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <polyline points="65,17 80,10" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3,2" />
        </>
      );
    }

    // Default: generic bullish or bearish
    if (direction === "bullish") {
      return (
        <polyline
          points="0,40 20,32 35,36 55,18 70,22 80,8"
          fill="none"
          stroke="#22c55e"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      );
    }
    return (
      <polyline
        points="0,10 20,18 35,14 55,32 70,28 80,42"
        fill="none"
        stroke="#ef4444"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    );
  };

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className="block"
      aria-hidden="true"
    >
      {getPath()}
    </svg>
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
      (e) =>
        e.term.toLowerCase().includes(q) ||
        e.definition.toLowerCase().includes(q) ||
        (e.example ?? "").toLowerCase().includes(q)
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

  const scrollTo = (letter: string) => {
    sectionRefs.current[letter]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
        <Input
          placeholder="Search terms, definitions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-background border-border/50"
        />
      </div>

      {/* Alphabet quick-jump */}
      {!search.trim() && (
        <div className="flex flex-wrap gap-1">
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() => scrollTo(letter)}
              disabled={!presentLetters.has(letter)}
              className={cn(
                "h-7 w-7 rounded text-xs font-medium transition-colors",
                presentLetters.has(letter)
                  ? "bg-muted hover:bg-accent text-foreground/80 cursor-pointer"
                  : "text-muted-foreground/25 cursor-default"
              )}
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      {/* Result count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "term" : "terms"}
        {search.trim() ? ` matching "${search}"` : ""}
      </p>

      {/* Groups */}
      <div className="flex flex-col gap-6">
        {Object.keys(grouped)
          .sort()
          .map((letter) => (
            <div
              key={letter}
              ref={(el) => { sectionRefs.current[letter] = el; }}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-bold text-primary">{letter}</span>
                <div className="h-px flex-1 bg-border/40" />
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[letter].map((entry) => {
                  const cat = CATEGORY_CONFIG[entry.category];
                  return (
                    <div
                      key={entry.term}
                      className="rounded-lg border border-border/50 bg-card p-3 flex flex-col gap-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold leading-tight">{entry.term}</span>
                        <Badge className={cn("text-xs shrink-0", cat.color)}>
                          {cat.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{entry.definition}</p>
                      {entry.example && (
                        <p className="text-xs text-muted-foreground/60 italic border-l-2 border-primary/30 pl-2">
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
          <p className="text-sm text-muted-foreground text-center py-8">No terms found.</p>
        )}
      </div>
    </div>
  );
}

// ─── Tab 2: Indicators ────────────────────────────────────────────────────────

function IndicatorsTab() {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const allIndicatorKeys = Object.keys(INDICATOR_EXPLANATIONS) as IndicatorType[];

  const filtered = useMemo(() => {
    const keys = INDICATOR_FILTER_CONFIG[filter];
    if (!keys || keys.length === 0) return allIndicatorKeys;
    return allIndicatorKeys.filter((k) => keys.includes(k));
  }, [filter, allIndicatorKeys]);

  return (
    <div className="flex flex-col gap-4">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(INDICATOR_FILTER_CONFIG).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((key) => {
          const info = INDICATOR_EXPLANATIONS[key];
          const isOpen = expanded === key;
          return (
            <div
              key={key}
              className="rounded-lg border border-border/50 bg-card overflow-hidden"
            >
              <button
                className="w-full text-left p-3 flex items-start justify-between gap-2"
                onClick={() => setExpanded(isOpen ? null : key)}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{info.name}</span>
                  <span className="text-xs text-muted-foreground">{info.shortDesc}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                )}
              </button>

              {isOpen && (
                <div className="border-t border-border/40 p-3 flex flex-col gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground/50 mb-1">How to read</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{info.howToRead}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-md bg-green-500/5 border border-green-500/15 p-2">
                      <p className="text-xs text-green-400 font-medium mb-0.5">Bull signal</p>
                      <p className="text-[11px] text-muted-foreground">{info.bullSignal}</p>
                    </div>
                    <div className="rounded-md bg-red-500/5 border border-red-500/15 p-2">
                      <p className="text-xs text-red-400 font-medium mb-0.5">Bear signal</p>
                      <p className="text-[11px] text-muted-foreground">{info.bearSignal}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground/50 mb-1">Best for</p>
                    <p className="text-xs text-muted-foreground">{info.bestFor}</p>
                  </div>
                  <div className="rounded-md bg-amber-500/5 border border-amber-500/15 p-2">
                    <p className="text-xs text-amber-400 font-medium mb-0.5">Common mistake</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{info.commonMistakes}</p>
                  </div>
                  <div className="rounded-md bg-primary/5 border border-primary/15 p-2">
                    <p className="text-xs text-primary font-medium mb-0.5">Pro tip</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{info.proTip}</p>
                  </div>
                  <div className="rounded-md bg-muted/30 p-2">
                    <p className="text-xs text-muted-foreground/60 font-medium mb-0.5">Example scenario</p>
                    <p className="text-[11px] text-muted-foreground/80 italic leading-relaxed">{info.exampleScenario}</p>
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
    return CHART_PATTERNS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
        <Input
          placeholder="Search patterns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-background border-border/50"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((pattern) => {
          const isOpen = expanded === pattern.name;
          return (
            <div key={pattern.name} className="rounded-lg border border-border/50 bg-card overflow-hidden">
              <button
                className="w-full text-left p-3"
                onClick={() => setExpanded(isOpen ? null : pattern.name)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-sm font-semibold leading-tight">{pattern.name}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                  )}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <TypeBadge type={pattern.type} />
                  <DirectionBadge direction={pattern.direction} />
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-xs text-muted-foreground/50">Reliability</span>
                    <ReliabilityDots score={pattern.reliability} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <ChartPatternSVG name={pattern.name} direction={pattern.direction} />
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground/50">Timeframe</p>
                    <p className="text-[11px] text-muted-foreground">{pattern.timeframe.split(".")[0]}</p>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border/40 p-3 flex flex-col gap-2.5">
                  <p className="text-xs text-muted-foreground leading-relaxed">{pattern.description}</p>
                  <div>
                    <p className="text-xs text-muted-foreground/50 mb-1">Psychology</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{pattern.psychology}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground/50 mb-1">How to identify</p>
                    <ul className="space-y-0.5">
                      {pattern.howToIdentify.map((step, i) => (
                        <li key={i} className="flex gap-1.5 text-xs text-muted-foreground">
                          <span className="text-primary shrink-0 font-medium">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["entry", "stopLoss", "target"] as const).map((field) => (
                      <div key={field} className="rounded-md bg-muted/30 p-2">
                        <p className="text-xs text-muted-foreground/50 font-medium mb-0.5 capitalize">
                          {field === "stopLoss" ? "Stop Loss" : field === "entry" ? "Entry" : "Target"}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{pattern.tradeSetup[field]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-sm text-muted-foreground text-center py-8">
            No patterns found.
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {(["All", "bullish", "bearish", "neutral"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition-colors capitalize",
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((pattern) => {
          const isOpen = expanded === pattern.name;
          const typeColor =
            pattern.type === "bullish"
              ? "bg-green-500/15 text-green-400 border-green-500/20"
              : pattern.type === "bearish"
              ? "bg-red-500/15 text-red-400 border-red-500/20"
              : "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/20";

          return (
            <div key={pattern.name} className="rounded-lg border border-border/50 bg-card overflow-hidden">
              <button
                className="w-full text-left p-3"
                onClick={() => setExpanded(isOpen ? null : pattern.name)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-semibold leading-tight">{pattern.name}</p>
                    <p className="text-[11px] text-muted-foreground/60">{pattern.japaneseName}</p>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={cn("text-xs", typeColor)}>
                    {pattern.type}
                  </Badge>
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-xs text-muted-foreground/50">Reliability</span>
                    <ReliabilityDots score={pattern.reliability} />
                  </div>
                </div>
                {/* SVG from data */}
                <div className="flex justify-center bg-muted/20 rounded-md py-2">
                  <svg
                    viewBox="0 0 50 50"
                    width={50}
                    height={50}
                    className="block"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: pattern.svg }}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border/40 p-3 flex flex-col gap-2.5">
                  <p className="text-xs text-muted-foreground leading-relaxed">{pattern.description}</p>
                  <div>
                    <p className="text-xs text-muted-foreground/50 mb-1">Psychology</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{pattern.psychology}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground/50 mb-1">How to trade</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{pattern.howToTrade}</p>
                  </div>
                  <div className="rounded-md bg-primary/5 border border-primary/15 p-2">
                    <p className="text-xs text-primary font-medium mb-0.5">Confirmation needed</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{pattern.confirmation}</p>
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

  const categoryColors: Record<string, string> = {
    risk: "bg-red-500/15 text-red-400 border-red-500/20",
    psychology: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    strategy: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    discipline: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    market: "bg-teal-500/15 text-teal-400 border-teal-500/20",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {WISDOM_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition-colors capitalize",
              filter === c
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((wisdom, i) => (
          <div key={i} className="rounded-lg border border-border/50 bg-card p-4 flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground/90 leading-relaxed italic">
              &ldquo;{wisdom.quote}&rdquo;
            </p>
            <p className="text-xs text-primary font-medium">— {wisdom.author}</p>
            <div className="mt-1 pt-2 border-t border-border/30">
              <Badge className={cn("text-xs mb-1.5", categoryColors[wisdom.category])}>
                {wisdom.category}
              </Badge>
              <p className="text-xs text-muted-foreground leading-relaxed">{wisdom.lesson}</p>
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

  const impactBadge = (impact: string) => {
    const words = impact.split(" ");
    const first = words[0].toLowerCase();
    if (first.includes("bullish") || first.includes("strong") || first.includes("higher"))
      return <span className="text-green-400">bullish</span>;
    if (first.includes("bearish") || first.includes("weak") || first.includes("lower"))
      return <span className="text-red-400">bearish</span>;
    return <span className="text-muted-foreground">mixed</span>;
  };

  const frequencyBadgeColor = (f: string) => {
    if (f === "weekly") return "bg-green-500/15 text-green-400 border-green-500/20";
    if (f === "monthly") return "bg-blue-500/15 text-blue-400 border-blue-500/20";
    return "bg-amber-500/15 text-amber-400 border-amber-500/20";
  };

  const leadingBadgeColor = (l: string) => {
    if (l === "leading") return "bg-primary/15 text-primary border-primary/20";
    if (l === "coincident") return "bg-teal-500/15 text-teal-400 border-teal-500/20";
    return "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/20";
  };

  return (
    <div className="flex flex-col gap-3">
      {ECONOMIC_INDICATORS.map((ind) => {
        const isOpen = expanded === ind.name;
        return (
          <div key={ind.name} className="rounded-lg border border-border/50 bg-card overflow-hidden">
            <button
              className="w-full text-left p-3 flex items-start justify-between gap-2"
              onClick={() => setExpanded(isOpen ? null : ind.name)}
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold">{ind.name}</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge className={cn("text-xs", frequencyBadgeColor(ind.frequency))}>
                    {ind.frequency}
                  </Badge>
                  <Badge className={cn("text-xs", leadingBadgeColor(ind.leadingOrLagging))}>
                    {ind.leadingOrLagging}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground/60">{ind.source}</span>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
              )}
            </button>

            <div className="px-3 pb-2">
              <p className="text-xs text-muted-foreground line-clamp-2">{ind.whatItMeasures}</p>
            </div>

            {isOpen && (
              <div className="border-t border-border/40 p-3 flex flex-col gap-3">
                <div>
                  <p className="text-xs text-muted-foreground/50 mb-1">Why it matters</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ind.whyItMatters}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground/50 mb-1">How to read it</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ind.howToRead}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground/50 mb-1">Market impact</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(["stocks", "bonds", "forex"] as const).map((asset) => (
                      <div key={asset} className="rounded-md bg-muted/30 p-2">
                        <p className="text-xs text-muted-foreground/50 capitalize mb-0.5">{asset}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{ind.marketImpact[asset]}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {ind.relatedIndicators.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground/50 mb-1.5">Related indicators</p>
                    <div className="flex flex-wrap gap-1">
                      {ind.relatedIndicators.map((r) => (
                        <Badge key={r} className="text-xs bg-muted/50 text-muted-foreground border-border/50">
                          {r}
                        </Badge>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
  { value: "dictionary", label: "Dictionary", icon: BookOpen },
  { value: "indicators", label: "Indicators", icon: BarChart2 },
  { value: "chart-patterns", label: "Chart Patterns", icon: TrendingUp },
  { value: "candlesticks", label: "Candlesticks", icon: BarChart2 },
  { value: "wisdom", label: "Market Wisdom", icon: Lightbulb },
  { value: "economics", label: "Economics", icon: Globe },
] as const;

export default function GlossaryPage() {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="border-b border-border/50 px-4 py-3 shrink-0">
        <h1 className="text-base font-semibold">Education Hub</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Reference library — glossary, indicators, patterns, wisdom, and economics
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4">
          <Tabs defaultValue="dictionary" className="flex flex-col gap-4">
            {/* Tab bar */}
            <TabsList className="flex h-auto flex-wrap gap-1 rounded-lg bg-muted/40 p-1 w-full">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  <tab.icon className="h-3 w-3" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="dictionary" className="mt-0">
              <DictionaryTab />
            </TabsContent>
            <TabsContent value="indicators" className="mt-0">
              <IndicatorsTab />
            </TabsContent>
            <TabsContent value="chart-patterns" className="mt-0">
              <ChartPatternsTab />
            </TabsContent>
            <TabsContent value="candlesticks" className="mt-0">
              <CandlestickPatternsTab />
            </TabsContent>
            <TabsContent value="wisdom" className="mt-0">
              <MarketWisdomTab />
            </TabsContent>
            <TabsContent value="economics" className="mt-0">
              <EconomicIndicatorsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
