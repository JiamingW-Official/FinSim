"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Shuffle,
  FlaskConical,
  Plus,
  X,
  ChevronDown,
  Save,
  BookOpen,
  Dice5,
  ShieldCheck,
  Gauge,
  Crosshair,
} from "lucide-react";
import type {
  BarGenPreset,
  BacktestConfig,
  StrategyConfig,
  ConditionRule,
  ExitType,
  PositionSizing,
  SavedStrategy,
} from "@/types/backtest";
import { WATCHLIST_STOCKS } from "@/types/market";
import { RULE_CATALOG } from "@/services/backtest/rule-catalog";
import { PRESET_LABELS } from "@/services/backtest/bar-presets";

const PRESET_ICONS: Record<BarGenPreset, React.ReactNode> = {
  trending_up: <TrendingUp className="h-4 w-4" />,
  trending_down: <TrendingDown className="h-4 w-4" />,
  sideways: <Activity className="h-4 w-4" />,
  volatile: <Zap className="h-4 w-4" />,
  random: <Shuffle className="h-4 w-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  momentum: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  trend: "text-green-400 bg-green-500/10 border-green-500/20",
  "mean-reversion": "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  volatility: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

const MC_OPTIONS = [
  { value: 0, label: "Off" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
  { value: 200, label: "200" },
];

interface StrategyPanelProps {
  onRun: (config: BacktestConfig) => void;
  isRunning: boolean;
  savedStrategies: SavedStrategy[];
  onLoadStrategy: (strategy: StrategyConfig) => void;
  onOpenTemplates: () => void;
  /** Fires when preset or barCount changes so the page can update preview */
  onPreviewChange: (preset: BarGenPreset, barCount: number) => void;
  /** Template config applied from the gallery */
  templateConfig: {
    config: Omit<StrategyConfig, "id" | "name" | "ticker">;
    preset: BarGenPreset;
    bars: number;
  } | null;
  onTemplateConsumed: () => void;
}

export default function StrategyPanel({
  onRun,
  isRunning,
  savedStrategies,
  onLoadStrategy,
  onOpenTemplates,
  onPreviewChange,
  templateConfig,
  onTemplateConsumed,
}: StrategyPanelProps) {
  const [ticker, setTicker] = useState("AAPL");
  const [preset, setPreset] = useState<BarGenPreset>("trending_up");
  const [barCount, setBarCount] = useState(200);
  const [entryRules, setEntryRules] = useState<ConditionRule[]>([]);
  const [exitRules, setExitRules] = useState<ExitType[]>([
    { kind: "stop_loss", percent: 5 },
    { kind: "profit_target", percent: 10 },
  ]);
  const [positionSizing, setPositionSizing] = useState<PositionSizing>({
    kind: "percent_of_capital",
    percent: 25,
  });
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [warmupBars, setWarmupBars] = useState(50);
  const [monteCarloRuns, setMonteCarloRuns] = useState(0);
  const [showRulePicker, setShowRulePicker] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Notify parent when preview-relevant settings change
  useEffect(() => {
    onPreviewChange(preset, barCount);
  }, [preset, barCount, onPreviewChange]);

  // Apply template config when received
  useEffect(() => {
    if (!templateConfig) return;
    const { config, preset: p, bars } = templateConfig;
    setEntryRules(config.entryRules);
    setExitRules(config.exitRules);
    setPositionSizing(config.positionSizing);
    setDirection(config.direction);
    setWarmupBars(config.warmupBars);
    setPreset(p);
    setBarCount(bars);
    onTemplateConsumed();
  }, [templateConfig, onTemplateConsumed]);

  const handleRun = () => {
    if (entryRules.length === 0) return;

    const strategy: StrategyConfig = {
      id: `strat-${Date.now()}`,
      name: `${ticker} Strategy`,
      ticker,
      entryRules,
      exitRules,
      positionSizing,
      direction,
      warmupBars,
      maxOpenTrades: 1,
    };

    const config: BacktestConfig = {
      strategy,
      barCount,
      startingCapital: 10000,
      seed: Math.floor(Math.random() * 100000),
      barGenPreset: preset,
      monteCarloRuns,
    };

    onRun(config);
  };

  const addEntryRule = (rule: ConditionRule) => {
    if (entryRules.length >= 3) return;
    if (entryRules.find((r) => r.id === rule.id)) return;
    setEntryRules([...entryRules, rule]);
    setShowRulePicker(false);
  };

  const removeEntryRule = (id: string) => {
    setEntryRules(entryRules.filter((r) => r.id !== id));
  };

  const updateExitRule = (index: number, exit: ExitType) => {
    const updated = [...exitRules];
    updated[index] = exit;
    setExitRules(updated);
  };

  const getExitValue = <K extends ExitType["kind"]>(
    kind: K,
  ): Extract<ExitType, { kind: K }> | undefined => {
    return exitRules.find((e) => e.kind === kind) as Extract<ExitType, { kind: K }> | undefined;
  };

  const setOrUpdateExit = (exit: ExitType) => {
    const idx = exitRules.findIndex((r) => r.kind === exit.kind);
    if (idx >= 0) updateExitRule(idx, exit);
    else setExitRules([...exitRules, exit]);
  };

  const toggleExit = (kind: ExitType["kind"], enabled: boolean, defaultExit: ExitType) => {
    if (enabled) {
      if (!exitRules.find((e) => e.kind === kind)) setExitRules([...exitRules, defaultExit]);
    } else {
      setExitRules(exitRules.filter((e) => e.kind !== kind));
    }
  };

  const loadStrategy = (saved: SavedStrategy) => {
    const s = saved.strategy;
    setTicker(s.ticker);
    setEntryRules(s.entryRules);
    setExitRules(s.exitRules);
    setPositionSizing(s.positionSizing);
    setDirection(s.direction);
    setWarmupBars(s.warmupBars);
    setShowSaved(false);
    onLoadStrategy(s);
  };

  return (
    <div className="flex h-full w-[300px] flex-col gap-3 overflow-y-auto border-r border-border/50 bg-muted/10 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-violet-400">
          <FlaskConical className="h-5 w-5" />
          <h2 className="text-sm font-bold tracking-wide uppercase">Strategy Builder</h2>
        </div>
      </div>

      {/* Template Gallery Button */}
      <button
        onClick={onOpenTemplates}
        className="flex items-center justify-center gap-2 rounded-lg border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 px-4 py-2.5 text-xs font-semibold text-violet-300 transition-all hover:border-violet-500/50 hover:from-violet-500/20 hover:to-fuchsia-500/20"
      >
        <BookOpen className="h-4 w-4" />
        Browse Strategy Templates
      </button>

      {/* Saved Strategies */}
      {savedStrategies.length > 0 && (
        <div>
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50"
          >
            <span className="flex items-center gap-1.5">
              <Save className="h-3 w-3" />
              Saved ({savedStrategies.length})
            </span>
            <ChevronDown className={`h-3 w-3 transition-transform ${showSaved ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {showSaved && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-1 space-y-1 overflow-hidden"
              >
                {savedStrategies.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => loadStrategy(s)}
                    className="w-full rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-left text-xs transition-colors hover:bg-violet-500/10"
                  >
                    <span className="font-medium text-foreground">{s.strategy.name}</span>
                    <span className="ml-2 text-muted-foreground">Grade {s.bestGrade}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Ticker */}
      <Section label="Ticker">
        <select
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors"
        >
          {WATCHLIST_STOCKS.map((s) => (
            <option key={s.ticker} value={s.ticker} className="bg-card">
              {s.ticker} — {s.name}
            </option>
          ))}
        </select>
      </Section>

      {/* Market Condition */}
      <Section label="Market Condition">
        <div className="grid grid-cols-1 gap-1">
          {(Object.keys(PRESET_LABELS) as BarGenPreset[]).map((key) => (
            <button
              key={key}
              onClick={() => setPreset(key)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-all ${
                preset === key
                  ? "border-violet-500/50 bg-violet-500/15 text-violet-300"
                  : "border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {PRESET_ICONS[key]}
              <span>{PRESET_LABELS[key].label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Bar Count */}
      <Section label="Bars">
        <div className="flex gap-2">
          {[100, 200, 365, 500].map((n) => (
            <button
              key={n}
              onClick={() => setBarCount(n)}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-all ${
                barCount === n
                  ? "border-violet-500/50 bg-violet-500/15 text-violet-300"
                  : "border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </Section>

      {/* Direction */}
      <Section label="Direction">
        <div className="flex gap-2">
          {(["long", "short"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDirection(d)}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition-all ${
                direction === d
                  ? d === "long"
                    ? "border-green-500/50 bg-green-500/15 text-green-300"
                    : "border-rose-500/50 bg-rose-500/15 text-rose-300"
                  : "border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </Section>

      {/* Entry Rules */}
      <Section label={`Entry Rules (${entryRules.length}/3)`} icon={<Crosshair className="h-3 w-3 text-green-400" />}>
        <div className="space-y-1.5">
          {entryRules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-1.5"
            >
              <span className="text-xs font-medium text-violet-300">{rule.label}</span>
              <button onClick={() => removeEntryRule(rule.id)} aria-label="Remove rule" className="text-muted-foreground hover:text-red-400">
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          ))}
          {entryRules.length < 3 && (
            <button
              onClick={() => setShowRulePicker(true)}
              className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground transition-colors hover:border-violet-500/30 hover:text-violet-400"
            >
              <Plus className="h-3 w-3" /> Add Rule
            </button>
          )}
        </div>

        {/* Rule Picker */}
        <AnimatePresence>
          {showRulePicker && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 max-h-52 space-y-1 overflow-y-auto rounded-lg border border-border bg-card p-2"
            >
              {RULE_CATALOG.filter((r) => !entryRules.find((er) => er.id === r.id)).map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => addEntryRule(entry.rule)}
                  className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[entry.category]}`}>
                      {entry.category}
                    </span>
                    <span className="text-xs font-medium text-foreground">{entry.label}</span>
                  </div>
                  <span className="mt-0.5 text-[11px] text-muted-foreground">{entry.description}</span>
                </button>
              ))}
              <button
                onClick={() => setShowRulePicker(false)}
                className="w-full pt-1 text-center text-[10px] text-muted-foreground/60 hover:text-muted-foreground"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      {/* Exit Rules */}
      <Section label="Exit Rules" icon={<ShieldCheck className="h-3 w-3 text-rose-400" />}>
        <div className="space-y-2.5">
          {/* Stop Loss */}
          <ExitSlider
            label="Stop Loss"
            enabled={!!getExitValue("stop_loss")}
            onToggle={(on) => toggleExit("stop_loss", on, { kind: "stop_loss", percent: 5 })}
            value={getExitValue("stop_loss")?.percent ?? 5}
            min={1}
            max={20}
            suffix="%"
            color="rose"
            onChange={(v) => setOrUpdateExit({ kind: "stop_loss", percent: v })}
          />

          {/* Profit Target */}
          <ExitSlider
            label="Profit Target"
            enabled={!!getExitValue("profit_target")}
            onToggle={(on) => toggleExit("profit_target", on, { kind: "profit_target", percent: 10 })}
            value={getExitValue("profit_target")?.percent ?? 10}
            min={1}
            max={30}
            suffix="%"
            color="emerald"
            onChange={(v) => setOrUpdateExit({ kind: "profit_target", percent: v })}
          />

          {/* Trailing Stop */}
          <ExitSlider
            label="Trailing Stop"
            enabled={!!getExitValue("trailing_stop")}
            onToggle={(on) => toggleExit("trailing_stop", on, { kind: "trailing_stop", percent: 5 })}
            value={(getExitValue("trailing_stop") as { kind: "trailing_stop"; percent: number } | undefined)?.percent ?? 5}
            min={1}
            max={15}
            suffix="%"
            color="amber"
            onChange={(v) => setOrUpdateExit({ kind: "trailing_stop", percent: v })}
          />

          {/* ATR Stop */}
          <ExitSlider
            label="ATR Stop"
            enabled={!!getExitValue("atr_stop")}
            onToggle={(on) => toggleExit("atr_stop", on, { kind: "atr_stop", multiplier: 2 })}
            value={(getExitValue("atr_stop") as { kind: "atr_stop"; multiplier: number } | undefined)?.multiplier ?? 2}
            min={0.5}
            max={5}
            step={0.5}
            suffix="x"
            color="cyan"
            onChange={(v) => setOrUpdateExit({ kind: "atr_stop", multiplier: v })}
          />

          {/* Max Hold */}
          <ExitSlider
            label="Max Hold"
            enabled={!!getExitValue("bars_held")}
            onToggle={(on) => toggleExit("bars_held", on, { kind: "bars_held", count: 20 })}
            value={(getExitValue("bars_held") as { kind: "bars_held"; count: number } | undefined)?.count ?? 20}
            min={5}
            max={100}
            suffix=" bars"
            color="violet"
            onChange={(v) => setOrUpdateExit({ kind: "bars_held", count: v })}
          />
        </div>
      </Section>

      {/* Position Sizing */}
      <Section label="Position Sizing">
        <div className="space-y-2">
          <div className="flex gap-1">
            {(["percent_of_capital", "fixed_shares", "kelly_criterion"] as const).map((kind) => (
              <button
                key={kind}
                onClick={() =>
                  setPositionSizing(
                    kind === "percent_of_capital"
                      ? { kind, percent: 25 }
                      : kind === "fixed_shares"
                        ? { kind, shares: 100 }
                        : { kind, maxPercent: 50 },
                  )
                }
                className={`flex-1 rounded-lg border px-1.5 py-1.5 text-[10px] font-medium transition-all ${
                  positionSizing.kind === kind
                    ? "border-violet-500/50 bg-violet-500/15 text-violet-300"
                    : "border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {kind === "percent_of_capital" ? "% Capital" : kind === "fixed_shares" ? "Fixed" : "Kelly"}
              </button>
            ))}
          </div>
          {positionSizing.kind === "percent_of_capital" && (
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={positionSizing.percent}
                onChange={(e) => setPositionSizing({ kind: "percent_of_capital", percent: +e.target.value })}
                aria-label="Percent of capital"
                className="flex-1 accent-violet-500"
              />
              <span className="w-10 text-right text-xs font-medium text-violet-400">
                {positionSizing.percent}%
              </span>
            </div>
          )}
          {positionSizing.kind === "fixed_shares" && (
            <input
              type="number"
              min={1}
              max={1000}
              value={positionSizing.shares}
              onChange={(e) => setPositionSizing({ kind: "fixed_shares", shares: Math.max(1, +e.target.value) })}
              aria-label="Fixed shares amount"
              className="w-full rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-sm text-foreground outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors"
            />
          )}
          {positionSizing.kind === "kelly_criterion" && (
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={positionSizing.maxPercent}
                  onChange={(e) => setPositionSizing({ kind: "kelly_criterion", maxPercent: +e.target.value })}
                  className="flex-1 accent-fuchsia-500"
                />
                <span className="w-10 text-right text-xs font-medium text-fuchsia-400">
                  {positionSizing.maxPercent}%
                </span>
              </div>
              <p className="mt-1 text-[9px] text-muted-foreground/60">
                Kelly fraction capped at max %. Uses win rate & payoff ratio.
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* Advanced Settings */}
      <Section label="Advanced" icon={<Gauge className="h-3 w-3 text-muted-foreground" />}>
        <div className="space-y-2.5">
          {/* Warmup Bars */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Warmup Period</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={20}
                max={100}
                step={5}
                value={warmupBars}
                onChange={(e) => setWarmupBars(+e.target.value)}
                className="flex-1 accent-primary"
              />
              <span className="w-12 text-right text-xs font-medium text-muted-foreground">
                {warmupBars} bars
              </span>
            </div>
            <p className="text-[9px] text-muted-foreground/60">Bars before first trade (indicator warmup)</p>
          </div>

          {/* Monte Carlo */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              <Dice5 className="h-3 w-3 text-fuchsia-400" />
              Monte Carlo Runs
            </label>
            <div className="flex gap-1.5">
              {MC_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMonteCarloRuns(opt.value)}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-[10px] font-medium transition-all ${
                    monteCarloRuns === opt.value
                      ? "border-fuchsia-500/50 bg-fuchsia-500/15 text-fuchsia-300"
                      : "border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-muted-foreground/60">
              {monteCarloRuns > 0
                ? `Simulate ${monteCarloRuns} market variations for probability analysis`
                : "Disabled — enable for statistical confidence analysis"}
            </p>
          </div>
        </div>
      </Section>

      {/* Run Button */}
      <button
        onClick={handleRun}
        disabled={isRunning || entryRules.length === 0}
        className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-violet-500/20 transition-all hover:shadow-violet-500/40 disabled:opacity-40 disabled:shadow-none"
      >
        <FlaskConical className="h-4 w-4" />
        {isRunning ? "Running..." : monteCarloRuns > 0 ? `Run Backtest + ${monteCarloRuns} MC` : "Run Backtest"}
      </button>
    </div>
  );
}

// ── Exit Rule Slider with Toggle ──────────────────────────────

function ExitSlider({
  label,
  enabled,
  onToggle,
  value,
  min,
  max,
  step = 1,
  suffix,
  color,
  onChange,
}: {
  label: string;
  enabled: boolean;
  onToggle: (on: boolean) => void;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix: string;
  color: string;
  onChange: (v: number) => void;
}) {
  const colorMap: Record<string, { accent: string; text: string; toggle: string }> = {
    rose: { accent: "accent-rose-500", text: "text-rose-400", toggle: "bg-rose-500" },
    emerald: { accent: "accent-green-500", text: "text-green-400", toggle: "bg-green-500" },
    amber: { accent: "accent-amber-500", text: "text-amber-400", toggle: "bg-amber-500" },
    cyan: { accent: "accent-cyan-500", text: "text-cyan-400", toggle: "bg-cyan-500" },
    violet: { accent: "accent-violet-500", text: "text-violet-400", toggle: "bg-violet-500" },
  };
  const c = colorMap[color] ?? colorMap.violet;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
        <button
          onClick={() => onToggle(!enabled)}
          className={`relative h-4 w-7 rounded-full transition-colors ${enabled ? c.toggle : "bg-muted"}`}
        >
          <span
            className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-3.5" : "translate-x-0.5"}`}
          />
        </button>
      </div>
      {enabled && (
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(+e.target.value)}
            className={`flex-1 ${c.accent}`}
          />
          <span className={`w-12 text-right text-xs font-medium ${c.text}`}>
            {step < 1 ? value.toFixed(1) : value}{suffix}
          </span>
        </div>
      )}
    </div>
  );
}

function Section({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </h3>
      {children}
    </div>
  );
}
