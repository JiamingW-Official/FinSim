"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  runScreener,
  PRESET_SCREENS,
  type ScreenerCriteria,
  type ScreenerResult,
} from "@/services/market/screener";

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
    default: return String((c as { type: string }).type);
  }
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-green-500"
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

interface ScreenerPanelProps {
  onSelectTicker?: (ticker: string) => void;
}

export function ScreenerPanel({ onSelectTicker }: ScreenerPanelProps) {
  const [activePreset, setActivePreset] = useState<number | null>(0);
  const [customCriteria, setCustomCriteria] = useState<ScreenerCriteria[]>([]);
  const [showCustom, setShowCustom] = useState(false);
  const [sortField, setSortField] = useState<"score" | "ticker">("score");
  const [sortAsc, setSortAsc] = useState(false);

  const activeCriteria = useMemo(() => {
    if (showCustom) return customCriteria;
    if (activePreset !== null && activePreset < PRESET_SCREENS.length) {
      return PRESET_SCREENS[activePreset].criteria;
    }
    return [];
  }, [showCustom, customCriteria, activePreset]);

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

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4 hover:border-border/60 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Stock Screener</h3>
        <span className="text-xs text-muted-foreground font-mono tabular-nums">
          {results.length} result{results.length !== 1 ? "s" : ""}
        </span>
      </div>

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
        {activePreset !== null && !showCustom && (
          <p className="text-[10px] text-muted-foreground">
            {PRESET_SCREENS[activePreset].description}
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
              "text-[10px] px-2 py-0.5 rounded border transition-colors",
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
                  aria-label="Remove filter"
                  className="hover:text-destructive transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
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
                className="text-[10px] px-1.5 py-0.5 rounded border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
              >
                + {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results table */}
      {sortedResults.length > 0 && (
        <div className="pt-2 border-t">
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
                  <th className="text-left py-1.5 px-1 font-medium">Name</th>
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
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((r) => (
                  <tr
                    key={r.ticker}
                    className="border-b border-muted/50 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => onSelectTicker?.(r.ticker)}
                  >
                    <td className="py-1.5 px-1 font-mono font-medium">{r.ticker}</td>
                    <td className="py-1.5 px-1 text-muted-foreground truncate max-w-[120px]">
                      {r.name}
                    </td>
                    <td className="py-1.5 px-1 text-right">
                      <ScoreBar score={r.score} />
                    </td>
                    <td className="py-1.5 px-1">
                      <div className="flex flex-wrap gap-0.5">
                        {r.matchedCriteria.map((mc) => (
                          <span
                            key={mc}
                            className="text-[10px] px-1 py-0 rounded bg-muted text-muted-foreground"
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeCriteria.length > 0 && sortedResults.length === 0 && (
        <div className="flex flex-col items-center gap-1 py-6 text-center text-xs text-muted-foreground">
          <span>No stocks match the selected criteria</span>
          <span className="text-[10px] opacity-60">Try relaxing your filters or removing a criterion</span>
        </div>
      )}

      {activeCriteria.length === 0 && (
        <div className="flex flex-col items-center gap-1 py-6 text-center text-xs text-muted-foreground">
          <span>Select a preset or add custom criteria to screen stocks</span>
          <span className="text-[10px] opacity-60">Choose from the presets above or build your own screen</span>
        </div>
      )}
    </div>
  );
}
