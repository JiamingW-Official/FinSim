"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  runScreener,
  PRESET_SCREENS,
  type ScreenerCriteria,
  type ScreenerResult,
  type PresetScreen,
} from "@/services/market/screener";

const SAVED_SCREENS_KEY = "finsim-saved-screens-v1";

const CRITERIA_OPTIONS: { label: string; build: () => ScreenerCriteria }[] = [
  { label: "P/E < 20", build: () => ({ type: "pe_below", value: 20 }) },
  { label: "P/E < 30", build: () => ({ type: "pe_below", value: 30 }) },
  { label: "P/E > 30", build: () => ({ type: "pe_above", value: 30 }) },
  { label: "Dividend > 1%", build: () => ({ type: "dividend_above", value: 1 }) },
  { label: "Dividend > 2%", build: () => ({ type: "dividend_above", value: 2 }) },
  { label: "RSI < 30", build: () => ({ type: "rsi_below", value: 30 }) },
  { label: "RSI < 40", build: () => ({ type: "rsi_below", value: 40 }) },
  { label: "RSI > 60", build: () => ({ type: "rsi_above", value: 60 }) },
  { label: "RSI > 70", build: () => ({ type: "rsi_above", value: 70 }) },
  { label: "Above 200 MA", build: () => ({ type: "above_200ma" }) },
  { label: "Below 200 MA", build: () => ({ type: "below_200ma" }) },
  { label: "High Momentum", build: () => ({ type: "high_momentum" }) },
  { label: "Low Volatility", build: () => ({ type: "low_volatility" }) },
  { label: "Value", build: () => ({ type: "value" }) },
  { label: "Growth", build: () => ({ type: "growth" }) },
  { label: "Quality", build: () => ({ type: "quality" }) },
  { label: "Momentum Rocket", build: () => ({ type: "momentum_rocket" }) },
  { label: "Oversold Bounce", build: () => ({ type: "oversold_bounce" }) },
  { label: "Earnings Beat", build: () => ({ type: "earnings_beat" }) },
  { label: "High Short Interest", build: () => ({ type: "high_short_interest" }) },
  { label: "Insider Buying", build: () => ({ type: "insider_buying" }) },
  { label: "Sector Leader", build: () => ({ type: "sector_leader" }) },
  { label: "Graham Number", build: () => ({ type: "graham_number" }) },
  { label: "CANSLIM-like", build: () => ({ type: "canslim_like" }) },
];

function criteriaToLabel(c: ScreenerCriteria): string {
  switch (c.type) {
    case "pe_below": return `P/E < ${c.value}`;
    case "pe_above": return `P/E > ${c.value}`;
    case "dividend_above": return `Div > ${c.value}%`;
    case "rsi_below": return `RSI < ${c.value}`;
    case "rsi_above": return `RSI > ${c.value}`;
    case "above_200ma": return "Above 200 MA";
    case "below_200ma": return "Below 200 MA";
    case "high_momentum": return "High Momentum";
    case "low_volatility": return "Low Vol";
    case "value": return "Value";
    case "growth": return "Growth";
    case "quality": return "Quality";
    case "momentum_rocket": return "Momentum Rocket";
    case "oversold_bounce": return "Oversold Bounce";
    case "earnings_beat": return "Earnings Beat";
    case "high_short_interest": return "High Short Int.";
    case "insider_buying": return "Insider Buying";
    case "sector_leader": return "Sector Leader";
    case "graham_number": return "Graham Number";
    case "canslim_like": return "CANSLIM-like";
  }
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-emerald-500"
      : score >= 60
        ? "bg-green-500"
        : score >= 40
          ? "bg-yellow-500"
          : "bg-orange-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", color)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="font-mono tabular-nums text-xs font-medium w-7 text-right">
        {score}
      </span>
    </div>
  );
}

/** 8-bar mini sparkline SVG (60×20 px) */
function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 60;
  const h = 20;
  const pad = 1;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + ((1 - (v - min) / range) * (h - pad * 2));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const isUp = data[data.length - 1] >= data[0];
  const color = isUp ? "#22c55e" : "#ef4444";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** AI signal badge */
function AISignalChip({ signal }: { signal: "bullish" | "bearish" | "neutral" }) {
  if (signal === "bullish") {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">
        Bull
      </span>
    );
  }
  if (signal === "bearish") {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 font-medium whitespace-nowrap">
        Bear
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium whitespace-nowrap">
      Neutral
    </span>
  );
}

/** Stats summary bar above results */
function ScreenerStatsBar({ results }: { results: ScreenerResult[] }) {
  if (results.length === 0) return null;

  const peValues = results
    .map((r) => r.metrics["P/E"] as number)
    .filter((v) => typeof v === "number" && v > 0);
  const avgPE = peValues.length > 0
    ? peValues.reduce((a, b) => a + b, 0) / peValues.length
    : null;

  const gainers = results.filter((r) => r.aiSignal === "bullish").length;
  const losers = results.filter((r) => r.aiSignal === "bearish").length;

  return (
    <div className="flex flex-wrap gap-3 py-2 px-1 text-xs text-muted-foreground border-b mb-2">
      <span>
        <span className="font-semibold text-foreground">{results.length}</span> matches
      </span>
      {avgPE !== null && (
        <span>
          Avg P/E: <span className="font-semibold text-foreground">{avgPE.toFixed(1)}</span>
        </span>
      )}
      <span>
        Bull/Bear:{" "}
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{gainers}</span>
        {" / "}
        <span className="font-semibold text-red-600 dark:text-red-400">{losers}</span>
      </span>
    </div>
  );
}

interface ScreenerPanelProps {
  onSelectTicker?: (ticker: string) => void;
}

export function ScreenerPanel({ onSelectTicker }: ScreenerPanelProps) {
  const router = useRouter();
  const [activePreset, setActivePreset] = useState<number | null>(0);
  const [customCriteria, setCustomCriteria] = useState<ScreenerCriteria[]>([]);
  const [showCustom, setShowCustom] = useState(false);
  const [sortField, setSortField] = useState<"score" | "ticker">("score");
  const [sortAsc, setSortAsc] = useState(false);

  // Saved screens (persisted to localStorage)
  const [savedScreens, setSavedScreens] = useState<PresetScreen[]>([]);
  const [saveScreenName, setSaveScreenName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  // Load saved screens from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_SCREENS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PresetScreen[];
        if (Array.isArray(parsed)) setSavedScreens(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const persistSavedScreens = useCallback((screens: PresetScreen[]) => {
    setSavedScreens(screens);
    try {
      localStorage.setItem(SAVED_SCREENS_KEY, JSON.stringify(screens));
    } catch {
      // ignore
    }
  }, []);

  const handleSaveScreen = useCallback(() => {
    const name = saveScreenName.trim() || `Custom Screen ${savedScreens.length + 1}`;
    const newScreen: PresetScreen = {
      name,
      description: `Custom: ${customCriteria.map(criteriaToLabel).join(", ")}`,
      criteria: [...customCriteria],
    };
    persistSavedScreens([...savedScreens, newScreen]);
    setSaveScreenName("");
    setShowSaveInput(false);
  }, [saveScreenName, customCriteria, savedScreens, persistSavedScreens]);

  const handleDeleteSavedScreen = useCallback(
    (index: number) => {
      const updated = savedScreens.filter((_, i) => i !== index);
      persistSavedScreens(updated);
    },
    [savedScreens, persistSavedScreens],
  );

  const activeCriteria = useMemo(() => {
    if (showCustom) return customCriteria;
    if (activePreset !== null) {
      const allPresets = [...PRESET_SCREENS, ...savedScreens];
      if (activePreset < allPresets.length) return allPresets[activePreset].criteria;
    }
    return [];
  }, [showCustom, customCriteria, activePreset, savedScreens]);

  const results = useMemo(() => {
    if (activeCriteria.length === 0) return [];
    return runScreener(activeCriteria);
  }, [activeCriteria]);

  const sortedResults = useMemo(() => {
    const sorted = [...results];
    if (sortField === "score") {
      sorted.sort((a, b) => (sortAsc ? a.score - b.score : b.score - a.score));
    } else {
      sorted.sort((a, b) =>
        sortAsc ? a.ticker.localeCompare(b.ticker) : b.ticker.localeCompare(a.ticker),
      );
    }
    return sorted;
  }, [results, sortField, sortAsc]);

  const handleSort = useCallback(
    (field: "score" | "ticker") => {
      if (sortField === field) {
        setSortAsc(!sortAsc);
      } else {
        setSortField(field);
        setSortAsc(false);
      }
    },
    [sortField, sortAsc],
  );

  const addCriteria = useCallback(
    (c: ScreenerCriteria) => {
      setCustomCriteria((prev) => [...prev, c]);
      setShowCustom(true);
      setActivePreset(null);
    },
    [],
  );

  const removeCriteria = useCallback(
    (index: number) => {
      setCustomCriteria((prev) => prev.filter((_, i) => i !== index));
    },
    [],
  );

  const handleTrade = useCallback(
    (ticker: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onSelectTicker?.(ticker);
      router.push("/trade");
    },
    [onSelectTicker, router],
  );

  const handleExportCSV = useCallback(() => {
    if (sortedResults.length === 0) return;
    const headers = ["Ticker", "Name", "Score", "AI Signal", "P/E", "Div Yield", "EPS Growth", "Matched Criteria"];
    const rows = sortedResults.map((r) => [
      r.ticker,
      `"${r.name}"`,
      r.score,
      r.aiSignal,
      r.metrics["P/E"] ?? "",
      r.metrics["Div Yield"] ?? "",
      r.metrics["EPS Growth"] ?? "",
      `"${r.matchedCriteria.join("; ")}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "screener-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedResults]);

  const allPresets = [...PRESET_SCREENS, ...savedScreens];
  const builtInCount = PRESET_SCREENS.length;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Stock Screener</h3>
        <div className="flex items-center gap-2">
          {sortedResults.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="text-xs px-2 py-0.5 rounded border border-dashed border-muted-foreground/40 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              title="Export results as CSV"
            >
              Export CSV
            </button>
          )}
          <span className="text-xs text-muted-foreground font-mono tabular-nums">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Saved screens pills (if any) */}
      {savedScreens.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Saved Screens</p>
          <div className="flex flex-wrap gap-1.5">
            {savedScreens.map((screen, idx) => {
              const presetIndex = builtInCount + idx;
              return (
                <div key={`saved-${idx}`} className="inline-flex items-center gap-0.5">
                  <button
                    onClick={() => {
                      setActivePreset(presetIndex);
                      setShowCustom(false);
                    }}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-l-lg border transition-colors",
                      activePreset === presetIndex && !showCustom
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted border-transparent",
                    )}
                  >
                    {screen.name}
                  </button>
                  <button
                    onClick={() => handleDeleteSavedScreen(idx)}
                    className="text-xs px-1 py-1 rounded-r-lg border border-l-0 border-transparent bg-muted/50 text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                    title="Delete saved screen"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Preset screens */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Presets</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_SCREENS.map((preset, i) => (
            <button
              key={preset.name}
              onClick={() => {
                setActivePreset(i);
                setShowCustom(false);
              }}
              className={cn(
                "text-xs px-2.5 py-1 rounded-lg border transition-colors",
                activePreset === i && !showCustom
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted border-transparent",
              )}
            >
              {preset.name}
            </button>
          ))}
        </div>
        {activePreset !== null && !showCustom && activePreset < allPresets.length && (
          <p className="text-xs text-muted-foreground">
            {allPresets[activePreset].description}
          </p>
        )}
      </div>

      {/* Custom criteria builder */}
      <div className="space-y-2 pt-2 border-t">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">Custom Criteria</p>
          <button
            onClick={() => {
              setShowCustom(true);
              setActivePreset(null);
            }}
            className={cn(
              "text-xs px-2 py-0.5 rounded border transition-colors",
              showCustom
                ? "bg-primary/10 text-primary border-primary/30"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {showCustom ? "Active" : "Switch to custom"}
          </button>
        </div>

        {/* Active custom criteria chips */}
        {showCustom && customCriteria.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {customCriteria.map((c, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg bg-primary/10 text-primary"
              >
                {criteriaToLabel(c)}
                <button
                  onClick={() => removeCriteria(i)}
                  className="hover:text-destructive transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Add criteria dropdown */}
        {showCustom && (
          <div className="flex flex-wrap gap-1">
            {CRITERIA_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => addCriteria(opt.build())}
                className="text-xs px-1.5 py-0.5 rounded border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
              >
                + {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Save custom screen */}
        {showCustom && customCriteria.length > 0 && (
          <div className="pt-1">
            {showSaveInput ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={saveScreenName}
                  onChange={(e) => setSaveScreenName(e.target.value)}
                  placeholder="Screen name..."
                  className="flex-1 text-xs px-2 py-1 rounded border border-muted-foreground/30 bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-0"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveScreen();
                    if (e.key === "Escape") setShowSaveInput(false);
                  }}
                  autoFocus
                />
                <button
                  onClick={handleSaveScreen}
                  className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowSaveInput(false)}
                  className="text-xs px-2 py-1 rounded border border-muted-foreground/30 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSaveInput(true)}
                className="text-xs px-2 py-1 rounded border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                + Save as screen
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results table */}
      {sortedResults.length > 0 && (
        <div className="pt-2 border-t">
          <ScreenerStatsBar results={sortedResults} />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th
                    className="text-left py-1.5 px-1 font-medium cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("ticker")}
                  >
                    Ticker
                    {sortField === "ticker" && (
                      <span className="ml-0.5">{sortAsc ? "^" : "v"}</span>
                    )}
                  </th>
                  <th className="text-left py-1.5 px-1 font-medium">Trend</th>
                  <th className="text-left py-1.5 px-1 font-medium">AI</th>
                  <th
                    className="text-right py-1.5 px-1 font-medium cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("score")}
                  >
                    Score
                    {sortField === "score" && (
                      <span className="ml-0.5">{sortAsc ? "^" : "v"}</span>
                    )}
                  </th>
                  <th className="text-left py-1.5 px-1 font-medium">Matched</th>
                  <th className="text-right py-1.5 px-1 font-medium">P/E</th>
                  <th className="text-right py-1.5 px-1 font-medium">Div</th>
                  <th className="py-1.5 px-1" />
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((r) => (
                  <tr
                    key={r.ticker}
                    className="border-b border-muted/50 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => onSelectTicker?.(r.ticker)}
                  >
                    <td className="py-1.5 px-1 font-mono font-medium">
                      <div className="flex flex-col">
                        <span>{r.ticker}</span>
                        <span className="text-xs text-muted-foreground font-sans font-normal truncate max-w-[72px]">
                          {r.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-1.5 px-1">
                      <Sparkline data={r.sparkline} />
                    </td>
                    <td className="py-1.5 px-1">
                      <AISignalChip signal={r.aiSignal} />
                    </td>
                    <td className="py-1.5 px-1 text-right">
                      <ScoreBar score={r.score} />
                    </td>
                    <td className="py-1.5 px-1">
                      <div className="flex flex-wrap gap-0.5">
                        {r.matchedCriteria.map((mc) => (
                          <span
                            key={mc}
                            className="text-xs px-1 py-0 rounded bg-muted text-muted-foreground"
                          >
                            {mc}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-1.5 px-1 text-right font-mono tabular-nums">
                      {typeof r.metrics["P/E"] === "number"
                        ? (r.metrics["P/E"] as number).toFixed(1)
                        : r.metrics["P/E"]}
                    </td>
                    <td className="py-1.5 px-1 text-right font-mono tabular-nums">
                      {r.metrics["Div Yield"]}
                    </td>
                    <td className="py-1.5 px-1">
                      <button
                        onClick={(e) => handleTrade(r.ticker, e)}
                        className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium whitespace-nowrap"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeCriteria.length > 0 && sortedResults.length === 0 && (
        <div className="py-6 text-center text-xs text-muted-foreground">
          No stocks match the selected criteria.
        </div>
      )}

      {activeCriteria.length === 0 && (
        <div className="py-6 text-center text-xs text-muted-foreground">
          Select a preset or add custom criteria to screen stocks.
        </div>
      )}
    </div>
  );
}
