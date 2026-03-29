"use client";

import { useState, useCallback } from "react";
import { Plus, X, ChevronDown, ChevronUp, Play, Save } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────

type IndicatorChoice =
  | "RSI"
  | "MACD"
  | "EMA"
  | "BB"
  | "ADX"
  | "OBV"
  | "CCI"
  | "Williams%R";

type ConditionChoice =
  | "crosses above"
  | "crosses below"
  | "is above"
  | "is below"
  | "value >";

type TargetPreset = "signal line" | "30" | "70" | "0" | "20" | "80";

interface EntryCondition {
  id: string;
  indicator: IndicatorChoice;
  condition: ConditionChoice;
  targetPreset: TargetPreset | null;
  targetNumber: number;
  usePreset: boolean;
}

interface ExitCondition {
  id: string;
  indicator: IndicatorChoice;
  condition: ConditionChoice;
  targetPreset: TargetPreset | null;
  targetNumber: number;
  usePreset: boolean;
}

interface VisualStrategy {
  id: string;
  name: string;
  entryConditions: EntryCondition[];
  entryLogic: "AND" | "OR";
  exitConditions: ExitCondition[];
  exitLogic: "AND" | "OR";
  stopLossPercent: number | null;
  positionSizePercent: number;
}

interface Props {
  savedStrategies: VisualStrategy[];
  onSaveStrategy: (strategy: VisualStrategy) => void;
  onRunCustomBacktest: (strategy: VisualStrategy) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────

const INDICATORS: IndicatorChoice[] = [
  "RSI", "MACD", "EMA", "BB", "ADX", "OBV", "CCI", "Williams%R",
];

const CONDITIONS: ConditionChoice[] = [
  "crosses above",
  "crosses below",
  "is above",
  "is below",
  "value >",
];

const TARGET_PRESETS: TargetPreset[] = ["signal line", "30", "70", "0", "20", "80"];

const INDICATOR_DEFAULTS: Record<IndicatorChoice, { defaultTarget: number; commonPresets: TargetPreset[] }> = {
  RSI: { defaultTarget: 30, commonPresets: ["30", "70"] },
  MACD: { defaultTarget: 0, commonPresets: ["signal line", "0"] },
  EMA: { defaultTarget: 0, commonPresets: ["0"] },
  BB: { defaultTarget: 0, commonPresets: ["0"] },
  ADX: { defaultTarget: 20, commonPresets: ["20"] },
  OBV: { defaultTarget: 0, commonPresets: ["0"] },
  CCI: { defaultTarget: 0, commonPresets: ["0", "80", "30"] },
  "Williams%R": { defaultTarget: -80, commonPresets: ["80", "20"] },
};

let conditionIdCounter = 0;
function genId() { return `cond-${++conditionIdCounter}-${Date.now()}`; }

function makeEntry(indicator: IndicatorChoice = "RSI"): EntryCondition {
  return {
    id: genId(),
    indicator,
    condition: "crosses above",
    targetPreset: "30",
    targetNumber: 30,
    usePreset: true,
  };
}

function makeExit(indicator: IndicatorChoice = "RSI"): ExitCondition {
  return {
    id: genId(),
    indicator,
    condition: "crosses below",
    targetPreset: "70",
    targetNumber: 70,
    usePreset: true,
  };
}

// ── Sub-components ────────────────────────────────────────────────────────

function ConditionRow({
  cond,
  onChange,
  onRemove,
  canRemove,
}: {
  cond: EntryCondition | ExitCondition;
  onChange: (updated: EntryCondition | ExitCondition) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const defaults = INDICATOR_DEFAULTS[cond.indicator];
  const relevantPresets = defaults.commonPresets;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/30 bg-muted/10 px-3 py-2">
      {/* Indicator dropdown */}
      <div className="relative">
        <select
          value={cond.indicator}
          onChange={(e) => {
            const ind = e.target.value as IndicatorChoice;
            const def = INDICATOR_DEFAULTS[ind];
            onChange({
              ...cond,
              indicator: ind,
              targetPreset: def.commonPresets[0] ?? null,
              targetNumber: def.defaultTarget,
            });
          }}
          className="appearance-none rounded-md border border-border/50 bg-card px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {INDICATORS.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>

      {/* Condition dropdown */}
      <div className="relative">
        <select
          value={cond.condition}
          onChange={(e) => onChange({ ...cond, condition: e.target.value as ConditionChoice })}
          className="appearance-none rounded-md border border-border/50 bg-card px-2 py-1 text-xs text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Target: presets or number */}
      <div className="flex items-center gap-1">
        {relevantPresets.map((p) => (
          <button
            key={p}
            onClick={() => onChange({ ...cond, usePreset: true, targetPreset: p })}
            className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
              cond.usePreset && cond.targetPreset === p
                ? "bg-primary text-white"
                : "bg-muted/20 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {p}
          </button>
        ))}
        {/* Custom number input */}
        <input
          type="number"
          value={cond.usePreset ? "" : cond.targetNumber}
          placeholder="custom"
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange({ ...cond, usePreset: false, targetPreset: null, targetNumber: v });
          }}
          className={`w-16 rounded-md border px-2 py-0.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            !cond.usePreset
              ? "border-primary bg-muted/40"
              : "border-border/50 bg-card"
          }`}
        />
      </div>

      {canRemove && (
        <button
          onClick={onRemove}
          className="ml-auto rounded p-0.5 text-muted-foreground/70 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export default function VisualStrategyBuilder({ savedStrategies, onSaveStrategy, onRunCustomBacktest }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [strategyName, setStrategyName] = useState("My Strategy");
  const [entryConditions, setEntryConditions] = useState<EntryCondition[]>([makeEntry("RSI")]);
  const [entryLogic, setEntryLogic] = useState<"AND" | "OR">("AND");
  const [exitConditions, setExitConditions] = useState<ExitCondition[]>([makeExit("RSI")]);
  const [exitLogic, setExitLogic] = useState<"AND" | "OR">("AND");
  const [stopLoss, setStopLoss] = useState<number | null>(5);
  const [positionSize, setPositionSize] = useState(50);
  const [loadIndex, setLoadIndex] = useState<number | null>(null);

  const buildStrategy = useCallback((): VisualStrategy => ({
    id: `vstrat-${Date.now()}`,
    name: strategyName,
    entryConditions,
    entryLogic,
    exitConditions,
    exitLogic,
    stopLossPercent: stopLoss,
    positionSizePercent: positionSize,
  }), [strategyName, entryConditions, entryLogic, exitConditions, exitLogic, stopLoss, positionSize]);

  const handleSave = () => onSaveStrategy(buildStrategy());
  const handleRun = () => onRunCustomBacktest(buildStrategy());

  const addEntry = () => {
    if (entryConditions.length >= 3) return;
    setEntryConditions((p) => [...p, makeEntry()]);
  };

  const addExit = () => {
    if (exitConditions.length >= 2) return;
    setExitConditions((p) => [...p, makeExit()]);
  };

  const loadSaved = (idx: number) => {
    const s = savedStrategies[idx];
    if (!s) return;
    setStrategyName(s.name);
    setEntryConditions(s.entryConditions);
    setEntryLogic(s.entryLogic);
    setExitConditions(s.exitConditions);
    setExitLogic(s.exitLogic);
    setStopLoss(s.stopLossPercent);
    setPositionSize(s.positionSizePercent);
    setLoadIndex(idx);
  };

  return (
    <div className="rounded-lg border border-border/30 bg-card/50">
      {/* Header row */}
      <button
        className="flex w-full items-center justify-between px-4 py-3"
        onClick={() => setIsCollapsed((v) => !v)}
      >
        <span className="text-sm font-semibold text-foreground">Visual Strategy Builder</span>
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {entryConditions.length} entry / {exitConditions.length} exit rules
            </span>
          )}
          {isCollapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {!isCollapsed && (
        <div className="space-y-4 border-t border-border/30 px-4 pb-4 pt-3">
          {/* Strategy name + load saved */}
          <div className="flex gap-2">
            <input
              type="text"
              value={strategyName}
              onChange={(e) => setStrategyName(e.target.value)}
              className="flex-1 rounded-md border border-border/50 bg-card px-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Strategy name..."
            />
            {savedStrategies.length > 0 && (
              <select
                value={loadIndex ?? ""}
                onChange={(e) => {
                  const idx = parseInt(e.target.value, 10);
                  if (!isNaN(idx)) loadSaved(idx);
                }}
                className="appearance-none rounded-md border border-border/50 bg-card px-2 py-1.5 text-xs text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Load saved...</option>
                {savedStrategies.map((s, i) => (
                  <option key={s.id} value={i}>{s.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Entry Conditions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Entry Conditions
              </span>
              <div className="flex items-center gap-2">
                {/* AND/OR toggle */}
                {entryConditions.length > 1 && (
                  <div className="flex rounded-md border border-border/50 overflow-hidden">
                    {(["AND", "OR"] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setEntryLogic(l)}
                        className={`px-2 py-0.5 text-xs font-medium transition-colors ${
                          entryLogic === l ? "bg-primary text-white" : "bg-card text-muted-foreground"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                )}
                {entryConditions.length < 3 && (
                  <button
                    onClick={addEntry}
                    className="flex items-center gap-1 rounded-md border border-border/50 bg-muted/20 px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted/50"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                )}
              </div>
            </div>
            {entryConditions.map((cond, i) => (
              <div key={cond.id}>
                {i > 0 && (
                  <div className="py-0.5 text-center text-xs font-semibold text-muted-foreground/70">
                    {entryLogic}
                  </div>
                )}
                <ConditionRow
                  cond={cond}
                  onChange={(updated) =>
                    setEntryConditions((prev) =>
                      prev.map((c) => (c.id === updated.id ? (updated as EntryCondition) : c)),
                    )
                  }
                  onRemove={() => setEntryConditions((prev) => prev.filter((c) => c.id !== cond.id))}
                  canRemove={entryConditions.length > 1}
                />
              </div>
            ))}
          </div>

          {/* Exit Conditions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Exit Conditions
              </span>
              <div className="flex items-center gap-2">
                {exitConditions.length > 1 && (
                  <div className="flex rounded-md border border-border/50 overflow-hidden">
                    {(["AND", "OR"] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setExitLogic(l)}
                        className={`px-2 py-0.5 text-xs font-medium transition-colors ${
                          exitLogic === l ? "bg-teal-600 text-white" : "bg-card text-muted-foreground"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                )}
                {exitConditions.length < 2 && (
                  <button
                    onClick={addExit}
                    className="flex items-center gap-1 rounded-md border border-border/50 bg-muted/20 px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted/50"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                )}
              </div>
            </div>
            {exitConditions.map((cond, i) => (
              <div key={cond.id}>
                {i > 0 && (
                  <div className="py-0.5 text-center text-xs font-semibold text-muted-foreground/70">
                    {exitLogic}
                  </div>
                )}
                <ConditionRow
                  cond={cond}
                  onChange={(updated) =>
                    setExitConditions((prev) =>
                      prev.map((c) => (c.id === updated.id ? (updated as ExitCondition) : c)),
                    )
                  }
                  onRemove={() => setExitConditions((prev) => prev.filter((c) => c.id !== cond.id))}
                  canRemove={exitConditions.length > 1}
                />
              </div>
            ))}

            {/* Stop loss */}
            <div className="flex items-center gap-3 rounded-lg border border-border/30 bg-muted/10 px-3 py-2">
              <span className="text-xs text-muted-foreground">Stop loss at</span>
              <input
                type="number"
                min={0}
                max={50}
                step={0.5}
                value={stopLoss ?? ""}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setStopLoss(isNaN(v) ? null : v);
                }}
                placeholder="off"
                className="w-14 rounded-md border border-border/50 bg-card px-2 py-0.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <span className="text-xs text-muted-foreground">%</span>
              {stopLoss !== null && (
                <button
                  onClick={() => setStopLoss(null)}
                  className="text-xs text-muted-foreground/70 hover:text-muted-foreground"
                >
                  off
                </button>
              )}
            </div>
          </div>

          {/* Position Sizing */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Position Size
              </span>
              <span className="text-xs font-bold text-primary">{positionSize}% of portfolio</span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={positionSize}
              onChange={(e) => setPositionSize(parseInt(e.target.value, 10))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-foreground/10 accent-blue-500"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground/70">
              <span>5%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/20 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50"
            >
              <Save className="h-3.5 w-3.5" /> Save
            </button>
            <button
              onClick={handleRun}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary"
            >
              <Play className="h-3.5 w-3.5" /> Run Custom Backtest
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export type { VisualStrategy };
