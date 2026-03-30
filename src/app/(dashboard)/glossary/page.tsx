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

const CATEGORY_CONFIG: Record<GlossaryEntry["category"], { label: string }> = {
  basics:             { label: "Basics" },
  orders:             { label: "Orders" },
  indicators:         { label: "Indicators" },
  risk:               { label: "Risk" },
  fundamental:        { label: "Fundamental" },
  "personal-finance": { label: "Personal" },
  crypto:             { label: "Crypto" },
  macro:              { label: "Macro" },
  "options-advanced": { label: "Options" },
  technical:          { label: "Technical" },
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

function FilterPills<T extends string>({
  options, active, onChange,
}: { options: readonly T[]; active: T; onChange: (v: T) => void }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "px-3 py-1.5 text-xs rounded-md font-medium transition-all border capitalize",
            active === opt
              ? "border-foreground/30 bg-foreground/[0.06] text-foreground"
              : "border-border/30 text-muted-foreground/40 hover:text-muted-foreground/70 hover:border-border/60",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function InfoSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/30 mb-1.5">{label}</p>
      <div className="text-xs text-muted-foreground/65 leading-relaxed">{children}</div>
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
      <line x1="0" y1="15" x2="80" y2="15" stroke="currentColor" strokeOpacity={0.2} strokeWidth="1" strokeDasharray="3,2" />
      <polyline points="0,42 20,15 30,30 50,15 60,22 80,15" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinejoin="round" />
    </>);
    if (lc.includes("descending triangle")) return (<>
      <line x1="0" y1="38" x2="80" y2="38" stroke="currentColor" strokeOpacity={0.2} strokeWidth="1" strokeDasharray="3,2" />
      <polyline points="0,10 20,38 30,22 50,38 60,28 80,38" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" />
    </>);
    if (lc.includes("symmetrical triangle")) return (
      <polyline points="0,8 15,35 25,18 40,30 50,20 65,28 80,25" fill="none" stroke="currentColor" strokeOpacity={0.5} strokeWidth="1.5" strokeLinejoin="round" />
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

// ─── Tab 1: Dictionary ────────────────────────────────────────────────────────

function DictionaryTab() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/30" />
        <input
          placeholder="Search terms, definitions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-border/50 bg-transparent pl-9 pr-3 py-2.5 text-xs rounded-lg focus:outline-none focus:border-foreground/25 placeholder:text-muted-foreground/20 transition-colors"
        />
      </div>

      {/* Alphabet bar */}
      {!search.trim() && (
        <div className="flex flex-wrap gap-0">
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => scrollTo(letter)}
              disabled={!presentLetters.has(letter)}
              className={cn(
                "h-6 w-6 text-[10px] font-mono transition-colors rounded",
                presentLetters.has(letter)
                  ? "text-muted-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] cursor-pointer"
                  : "text-muted-foreground/15 cursor-default",
              )}
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      <p className="text-[10px] font-mono text-muted-foreground/25 tracking-wide">
        {filtered.length} {filtered.length === 1 ? "term" : "terms"}{search.trim() ? ` for "${search}"` : ""}
      </p>

      {/* Grouped sections */}
      <div className="flex flex-col gap-8">
        {Object.keys(grouped).sort().map((letter) => (
          <div key={letter} ref={(el) => { sectionRefs.current[letter] = el; }}>
            <div className="flex items-center gap-4 mb-1">
              <span className="text-lg font-bold text-foreground/10 select-none leading-none w-5">{letter}</span>
              <div className="h-px flex-1 bg-border/30" />
            </div>
            <div className="divide-y divide-border/25">
              {grouped[letter].map((entry) => {
                const isOpen = expanded === entry.term;
                return (
                  <div key={entry.term}>
                    <button
                      type="button"
                      className="w-full text-left py-3 flex items-start gap-5 hover:bg-foreground/[0.02] -mx-1 px-1 rounded transition-colors"
                      onClick={() => setExpanded(isOpen ? null : entry.term)}
                    >
                      <span className="text-sm font-medium text-foreground/85 w-36 shrink-0 leading-relaxed">{entry.term}</span>
                      <span className="text-xs text-muted-foreground/55 flex-1 leading-relaxed text-left">{entry.definition}</span>
                      <span className="text-[10px] font-mono text-muted-foreground/25 shrink-0 mt-0.5 w-16 text-right">{CATEGORY_CONFIG[entry.category]?.label}</span>
                    </button>
                    {isOpen && entry.example && (
                      <div className="pb-3 pl-[calc(9rem+1.25rem)] pr-1">
                        <p className="text-[11px] text-muted-foreground/40 italic border-l border-foreground/10 pl-3 leading-relaxed">{entry.example}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {Object.keys(grouped).length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground/30">No terms found for &ldquo;{search}&rdquo;</p>
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
      <FilterPills options={Object.keys(INDICATOR_FILTER_CONFIG) as string[]} active={filter} onChange={setFilter} />
      <div className="flex flex-col gap-0 divide-y divide-border/25">
        {filtered.map((key) => {
          const info = INDICATOR_EXPLANATIONS[key];
          const isOpen = expanded === key;
          return (
            <div key={key}>
              <button
                type="button"
                className="w-full text-left py-3.5 flex items-start justify-between gap-3 hover:bg-foreground/[0.02] -mx-1 px-1 rounded transition-colors"
                onClick={() => setExpanded(isOpen ? null : key)}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium text-foreground/85">{info.name}</span>
                  <span className="text-xs text-muted-foreground/40 leading-tight">{info.shortDesc}</span>
                </div>
                <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground/25 shrink-0 mt-1 transition-transform", isOpen && "rotate-180")} />
              </button>

              {isOpen && (
                <div className="pb-5 flex flex-col gap-4 pl-1">
                  <InfoSection label="How to read">{info.howToRead}</InfoSection>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-l-2 border-emerald-500/40 pl-3">
                      <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground/30 mb-1">Bull signal</p>
                      <p className="text-xs text-muted-foreground/60 leading-relaxed">{info.bullSignal}</p>
                    </div>
                    <div className="border-l-2 border-rose-500/35 pl-3">
                      <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground/30 mb-1">Bear signal</p>
                      <p className="text-xs text-muted-foreground/60 leading-relaxed">{info.bearSignal}</p>
                    </div>
                  </div>
                  <InfoSection label="Best for">{info.bestFor}</InfoSection>
                  {info.commonMistakes && <InfoSection label="Common mistake">{info.commonMistakes}</InfoSection>}
                  {info.proTip && <InfoSection label="Pro tip">{info.proTip}</InfoSection>}
                  {info.exampleScenario && (
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/30 mb-1.5">Example</p>
                      <p className="text-xs text-muted-foreground/45 italic leading-relaxed border-l border-foreground/10 pl-3">{info.exampleScenario}</p>
                    </div>
                  )}
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/30" />
        <input
          placeholder="Search patterns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-border/50 bg-transparent pl-9 pr-3 py-2.5 text-xs rounded-lg focus:outline-none focus:border-foreground/25 placeholder:text-muted-foreground/20 transition-colors"
        />
      </div>

      <div className="divide-y divide-border/25">
        {filtered.map((pattern) => {
          const isOpen = expanded === pattern.name;
          const dirColor = pattern.direction === "bullish" ? "text-emerald-400/60" : pattern.direction === "bearish" ? "text-rose-400/55" : "text-muted-foreground/35";
          return (
            <div key={pattern.name}>
              <button
                type="button"
                className="w-full text-left py-3.5 flex items-center gap-4 hover:bg-foreground/[0.02] -mx-1 px-1 rounded transition-colors"
                onClick={() => setExpanded(isOpen ? null : pattern.name)}
              >
                <div className="shrink-0 opacity-60">
                  <ChartPatternSVG name={pattern.name} direction={pattern.direction} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground/85">{pattern.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-mono uppercase ${dirColor}`}>{pattern.direction}</span>
                    <span className="text-muted-foreground/20">·</span>
                    <span className="text-[10px] font-mono text-muted-foreground/30">{pattern.type}</span>
                    <span className="text-muted-foreground/20">·</span>
                    <span className="text-[10px] font-mono text-muted-foreground/25">
                      {"●".repeat(pattern.reliability)}{"○".repeat(5 - pattern.reliability)}
                    </span>
                  </div>
                </div>
                <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground/25 shrink-0 transition-transform", isOpen && "rotate-180")} />
              </button>

              {isOpen && (
                <div className="pb-5 flex flex-col gap-4 pl-1">
                  <InfoSection label="Description">{pattern.description}</InfoSection>
                  <InfoSection label="Psychology">{pattern.psychology}</InfoSection>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/30 mb-2">How to identify</p>
                    <ol className="flex flex-col gap-1.5">
                      {pattern.howToIdentify.map((step, i) => (
                        <li key={i} className="flex gap-2.5 text-xs text-muted-foreground/60">
                          <span className="font-mono text-muted-foreground/30 shrink-0">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(["entry", "stopLoss", "target"] as const).map((field) => (
                      <div key={field}>
                        <p className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground/25 mb-1">
                          {field === "stopLoss" ? "Stop" : field}
                        </p>
                        <p className="text-xs text-muted-foreground/55 leading-snug">{pattern.tradeSetup[field]}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground/25">Timeframe: {pattern.timeframe.split(".")[0]}</p>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground/30">No patterns found</p>
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
      <FilterPills options={["All", "bullish", "bearish", "neutral"] as const} active={filter} onChange={setFilter} />
      <div className="divide-y divide-border/25">
        {filtered.map((pattern) => {
          const isOpen = expanded === pattern.name;
          const typeColor =
            pattern.type === "bullish" ? "text-emerald-400/60"
            : pattern.type === "bearish" ? "text-rose-400/55"
            : "text-muted-foreground/35";
          return (
            <div key={pattern.name}>
              <button
                type="button"
                className="w-full text-left py-3.5 flex items-center gap-4 hover:bg-foreground/[0.02] -mx-1 px-1 rounded transition-colors"
                onClick={() => setExpanded(isOpen ? null : pattern.name)}
              >
                <div className="shrink-0 opacity-70">
                  <svg viewBox="0 0 50 50" width={40} height={40} className="block" aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: pattern.svg }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground/85">{pattern.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-mono uppercase ${typeColor}`}>{pattern.type}</span>
                    {pattern.japaneseName && (
                      <><span className="text-muted-foreground/20">·</span>
                      <span className="text-[10px] font-mono text-muted-foreground/25">{pattern.japaneseName}</span></>
                    )}
                    <span className="ml-auto text-[10px] font-mono text-muted-foreground/25">
                      {"●".repeat(pattern.reliability)}{"○".repeat(5 - pattern.reliability)}
                    </span>
                  </div>
                </div>
                <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground/25 shrink-0 transition-transform", isOpen && "rotate-180")} />
              </button>

              {isOpen && (
                <div className="pb-5 flex flex-col gap-4 pl-1">
                  <InfoSection label="Description">{pattern.description}</InfoSection>
                  <InfoSection label="Psychology">{pattern.psychology}</InfoSection>
                  <InfoSection label="How to trade">{pattern.howToTrade}</InfoSection>
                  <InfoSection label="Confirmation">{pattern.confirmation}</InfoSection>
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

  return (
    <div className="flex flex-col gap-5">
      <FilterPills options={WISDOM_CATEGORIES} active={filter} onChange={setFilter} />
      <div className="flex flex-col gap-6">
        {filtered.map((wisdom, i) => (
          <div key={i} className="flex flex-col gap-3 py-5 border-b border-border/25 last:border-0">
            <p className="text-base font-serif font-medium text-foreground/80 leading-relaxed italic">
              &ldquo;{wisdom.quote}&rdquo;
            </p>
            <p className="text-[11px] font-mono text-muted-foreground/35">— {wisdom.author}</p>
            <p className="text-xs text-muted-foreground/50 leading-relaxed">{wisdom.lesson}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab 6: Economic Indicators ───────────────────────────────────────────────

function EconomicIndicatorsTab() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="divide-y divide-border/25">
      {ECONOMIC_INDICATORS.map((ind) => {
        const isOpen = expanded === ind.name;
        return (
          <div key={ind.name}>
            <button
              type="button"
              className="w-full text-left py-3.5 flex items-start justify-between gap-3 hover:bg-foreground/[0.02] -mx-1 px-1 rounded transition-colors"
              onClick={() => setExpanded(isOpen ? null : ind.name)}
            >
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <span className="text-sm font-medium text-foreground/85">{ind.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground/30 uppercase">{ind.frequency}</span>
                  <span className="text-muted-foreground/20">·</span>
                  <span className="text-[10px] font-mono text-muted-foreground/30">{ind.leadingOrLagging}</span>
                  <span className="text-muted-foreground/20">·</span>
                  <span className="text-[10px] font-mono text-muted-foreground/20">{ind.source}</span>
                </div>
                <p className="text-xs text-muted-foreground/40 line-clamp-1 leading-relaxed">{ind.whatItMeasures}</p>
              </div>
              <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground/25 shrink-0 mt-1 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
              <div className="pb-5 flex flex-col gap-4 pl-1">
                <InfoSection label="Why it matters">{ind.whyItMatters}</InfoSection>
                <InfoSection label="How to read">{ind.howToRead}</InfoSection>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/30 mb-2">Market impact</p>
                  <div className="grid grid-cols-3 gap-4">
                    {(["stocks", "bonds", "forex"] as const).map((asset) => (
                      <div key={asset}>
                        <p className="text-[10px] font-mono uppercase text-muted-foreground/25 mb-1">{asset}</p>
                        <p className="text-xs text-muted-foreground/55 leading-snug">{ind.marketImpact[asset]}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {ind.relatedIndicators.length > 0 && (
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/30 mb-2">Related</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ind.relatedIndicators.map((r) => (
                        <span key={r} className="text-[10px] font-mono text-muted-foreground/35 border border-border/30 rounded px-2 py-0.5">{r}</span>
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
  { value: "dictionary",     label: "Dictionary" },
  { value: "indicators",     label: "Indicators" },
  { value: "chart-patterns", label: "Patterns" },
  { value: "candlesticks",   label: "Candles" },
  { value: "wisdom",         label: "Wisdom" },
  { value: "economics",      label: "Economics" },
] as const;

type TabValue = typeof TABS[number]["value"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GlossaryPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("dictionary");

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="border-b border-border px-6 pt-5 pb-0 shrink-0">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/25 mb-1.5">Reference</p>
        <h1 className="text-base font-semibold tracking-tight mb-1">Education Hub</h1>

        {/* Tab bar */}
        <div className="flex items-center gap-0 mt-3">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-4 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px",
                activeTab === tab.value
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground/35 hover:text-muted-foreground/65 hover:border-border/50",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6">
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
