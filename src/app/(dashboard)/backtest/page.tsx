"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import { useBacktestStore } from "@/stores/backtest-store";
import StrategyPanel from "@/components/backtest/StrategyPanel";
import BacktestChart from "@/components/backtest/BacktestChart";
import ResultsPanel from "@/components/backtest/ResultsPanel";
import StrategyTemplateGallery from "@/components/backtest/StrategyTemplateGallery";
import VisualStrategyBuilder from "@/components/backtest/VisualStrategyBuilder";
import type { VisualStrategy } from "@/components/backtest/VisualStrategyBuilder";
import EarningsAnalysis from "@/components/backtest/EarningsAnalysis";
import MonteCarloPanelV2 from "@/components/backtest/MonteCarloPanelV2";
import WalkForwardPanel, { generateWalkForwardResult } from "@/components/backtest/WalkForwardPanel";
import OptimizationPanel from "@/components/backtest/OptimizationPanel";
import { Confetti } from "@/components/learn/Confetti";
import { soundEngine } from "@/services/audio/sound-engine";
import { generateRealisticBars } from "@/data/lessons/practice-data";
import { BAR_PRESETS } from "@/services/backtest/bar-presets";
import type { BacktestConfig, BacktestBar, StrategyConfig, BarGenPreset } from "@/types/backtest";
import { WATCHLIST_STOCKS } from "@/types/market";

/** Convert practice bars to BacktestBar format with timestamps */
function toBacktestBars(preset: BarGenPreset, barCount: number, seed: number): BacktestBar[] {
  const params = BAR_PRESETS[preset];
  const practiceBars = generateRealisticBars({ ...params, count: barCount, seed });
  const baseTimestamp = Date.now() - barCount * 86400 * 1000;
  return practiceBars.map((b, i) => ({
    open: b.open,
    high: b.high,
    low: b.low,
    close: b.close,
    volume: b.volume,
    timestamp: baseTimestamp + i * 86400 * 1000,
  }));
}

// ── Tab types ─────────────────────────────────────────────────────────────

type PageTab = "strategy" | "earnings" | "montecarlo" | "walkforward" | "optimization";

const TABS: { id: PageTab; label: string }[] = [
  { id: "strategy", label: "Strategy Backtest" },
  { id: "earnings", label: "Event Analysis" },
  { id: "montecarlo", label: "Monte Carlo" },
  { id: "walkforward", label: "Walk-Forward" },
  { id: "optimization", label: "Optimization" },
];

// ── Default example strategy (RSI mean-reversion on AAPL) ────────────────

const DEFAULT_RSI_CONFIG: BacktestConfig = {
  strategy: {
    id: "example-rsi",
    name: "RSI Mean Reversion",
    ticker: "AAPL",
    entryRules: [
      {
        id: "entry-rsi-30",
        source: "rsi14",
        operator: "crosses_above",
        target: 30,
        label: "RSI(14) crosses above 30",
      },
    ],
    exitRules: [
      {
        kind: "condition",
        rule: {
          id: "exit-rsi-70",
          source: "rsi14",
          operator: "crosses_below",
          target: 70,
          label: "RSI(14) crosses below 70",
        },
      },
    ],
    positionSizing: { kind: "percent_of_capital", percent: 95 },
    direction: "long",
    warmupBars: 20,
    maxOpenTrades: 1,
  },
  barCount: 200,
  startingCapital: 10000,
  seed: 42,
  barGenPreset: "trending_up",
  monteCarloRuns: 0,
};

/** Build a compact summary string from a BacktestConfig */
function buildConfigSummary(config: BacktestConfig): string {
  const { strategy, barCount } = config;
  const entryNames = strategy.entryRules.map((r) => r.label).join(" + ");
  const direction = strategy.direction === "long" ? "Long only" : strategy.direction === "short" ? "Short only" : "Long/Short";
  return `${entryNames} on ${strategy.ticker} \u2022 ${barCount} bars \u2022 ${direction}`;
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function BacktestPage() {
  const store = useBacktestStore();
  const [activeTab, setActiveTab] = useState<PageTab>("strategy");
  const [isRunning, setIsRunning] = useState(false);
  const didAutoRun = useRef(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateConfig, setTemplateConfig] = useState<{
    config: Omit<StrategyConfig, "id" | "name" | "ticker">;
    preset: BarGenPreset;
    bars: number;
  } | null>(null);
  const latestConfigRef = useRef<BacktestConfig | null>(null);

  // Whether the strategy editor is expanded (when results are showing)
  const [editorExpanded, setEditorExpanded] = useState(false);

  // Visual Strategy Builder state
  const [visualSavedStrategies, setVisualSavedStrategies] = useState<VisualStrategy[]>([]);

  // Earnings analysis ticker
  const earningsTicker = store.currentResult?.config.strategy.ticker ?? "AAPL";

  // Walk-Forward result (generated from last backtest seed)
  const walkForwardResult = useMemo(() => {
    if (!store.currentResult) return null;
    return generateWalkForwardResult(store.currentResult.config.seed, 5);
  }, [store.currentResult]);

  // Preview state — seed + preset + barCount drive preview bar generation
  const [previewSeed, setPreviewSeed] = useState(() => Math.floor(Math.random() * 100000));
  const [previewPreset, setPreviewPreset] = useState<BarGenPreset>("trending_up");
  const [previewBarCount, setPreviewBarCount] = useState(200);

  // Generate preview bars (memoized — only recalculates when inputs change)
  const previewBars = useMemo(
    () => toBacktestBars(previewPreset, previewBarCount, previewSeed),
    [previewPreset, previewBarCount, previewSeed],
  );

  // Whether we're showing preview vs backtest results
  const hasResult = !!store.currentResult && !isRunning;

  const handlePreviewChange = useCallback((preset: BarGenPreset, barCount: number) => {
    setPreviewPreset(preset);
    setPreviewBarCount(barCount);
  }, []);

  const handleRegenerate = useCallback(() => {
    setPreviewSeed(Math.floor(Math.random() * 100000));
  }, []);

  const handleRun = useCallback(
    (config: BacktestConfig) => {
      setIsRunning(true);
      setEditorExpanded(false);
      latestConfigRef.current = config;

      setTimeout(() => {
        const result = store.executeBacktest(config);
        setIsRunning(false);

        let xp = 20;
        if (result.metrics.totalReturn > 0) xp += 30;
        if (result.metrics.sharpeRatio > 1) xp += 50;
        if (result.metrics.sortinoRatio > 1.5) xp += 25;
        if (config.monteCarloRuns > 0) xp += 15;
        setXpEarned(xp);

        if (result.grade === "S" || result.grade === "A") {
          soundEngine.playLessonComplete();
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        } else if (result.metrics.totalReturn > 0) {
          soundEngine.playCorrect();
        } else {
          soundEngine.playWrong();
        }
      }, 300);
    },
    [store],
  );

  const handleRerun = useCallback(() => {
    if (!latestConfigRef.current) return;
    const config = {
      ...latestConfigRef.current,
      seed: Math.floor(Math.random() * 100000),
    };
    handleRun(config);
  }, [handleRun]);

  const handleSave = useCallback(() => {
    if (store.currentResult) {
      store.saveStrategy(store.currentResult.config.strategy);
      soundEngine.playClaim();
    }
  }, [store]);

  const handleLoadStrategy = useCallback((_strategy: StrategyConfig) => {
    // Strategy gets loaded into the panel via StrategyPanel's internal state
  }, []);

  const handleTemplateSelect = useCallback(
    (config: Omit<StrategyConfig, "id" | "name" | "ticker">, preset: BarGenPreset, bars: number) => {
      setTemplateConfig({ config, preset, bars });
      setShowTemplates(false);
    },
    [],
  );

  const handleTemplateConsumed = useCallback(() => {
    setTemplateConfig(null);
  }, []);

  const handleSaveVisualStrategy = useCallback((strategy: VisualStrategy) => {
    setVisualSavedStrategies((prev) => {
      const exists = prev.findIndex((s) => s.id === strategy.id);
      if (exists >= 0) {
        return prev.map((s, i) => (i === exists ? strategy : s));
      }
      return [...prev, { ...strategy, id: `vstrat-${Date.now()}` }];
    });
  }, []);

  const handleRunCustomBacktest = useCallback((_strategy: VisualStrategy) => {
    if (!latestConfigRef.current) return;
    handleRun({
      ...latestConfigRef.current,
      seed: Math.floor(Math.random() * 100000),
    });
  }, [handleRun]);

  // Auto-run example strategy on first visit so the page isn't empty
  useEffect(() => {
    if (didAutoRun.current || store.currentResult) return;
    didAutoRun.current = true;
    handleRun(DEFAULT_RSI_CONFIG);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Decide which bars to show in the chart
  const chartBars = hasResult ? store.currentResult!.bars : previewBars;
  const chartTrades = hasResult ? store.currentResult!.trades : [];
  const isPreview = !hasResult && !isRunning;

  // Earnings ticker options
  const tickerOptions = WATCHLIST_STOCKS.map((s) => s.ticker);

  // Config summary for the collapsed bar
  const configSummary = latestConfigRef.current
    ? buildConfigSummary(latestConfigRef.current)
    : store.currentResult
      ? buildConfigSummary(store.currentResult.config)
      : "";

  return (
    <div className="flex h-full flex-col">
      {/* Header — quiet zone */}
      <div className="flex items-center gap-3 border-b border-border bg-card/60 px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
          <FlaskConical className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-foreground">Strategy Backtester</h1>
          <p className="text-xs text-muted-foreground">Build, test, and optimize on simulated market data</p>
        </div>
        <span className="ml-4 rounded bg-muted/40 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          Simulated historical data
        </span>
        {store.totalBacktestsRun > 0 && (
          <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
            <span>{store.totalBacktestsRun} backtests run</span>
            <span>{store.savedStrategies.length} saved</span>
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-border/60 bg-card/30">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-muted-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Tab 1: Strategy Backtest — Results-dominant layout */}
        {activeTab === "strategy" && (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* When results exist: compact config summary bar at top */}
            {hasResult && !editorExpanded && (
              <div className="flex items-center gap-3 border-b border-border/40 bg-card/40 px-4 py-2">
                <span className="flex-1 truncate text-xs text-muted-foreground">
                  {configSummary}
                </span>
                <button
                  onClick={() => setEditorExpanded(true)}
                  className="flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => setEditorExpanded(true)}
                  className="text-muted-foreground/60 hover:text-muted-foreground"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Expandable editor overlay when results are showing */}
            <AnimatePresence>
              {hasResult && editorExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", damping: 24, stiffness: 260 }}
                  className="overflow-hidden border-b border-border/40"
                >
                  <div className="flex">
                    <div className="flex-1 overflow-y-auto" style={{ maxHeight: "50vh" }}>
                      <StrategyPanel
                        onRun={handleRun}
                        isRunning={isRunning}
                        savedStrategies={store.savedStrategies}
                        onLoadStrategy={handleLoadStrategy}
                        onOpenTemplates={() => setShowTemplates(true)}
                        onPreviewChange={handlePreviewChange}
                        templateConfig={templateConfig}
                        onTemplateConsumed={handleTemplateConsumed}
                      />
                    </div>
                    <button
                      onClick={() => setEditorExpanded(false)}
                      className="flex items-start px-3 pt-3 text-muted-foreground/60 hover:text-muted-foreground"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main content area — switches between builder-first and results-first */}
            {hasResult ? (
              /* ── Results-dominant layout ─────────────────────────────── */
              <>
              {/* Buffer between summary bar and results */}
              <div className="h-6" />
              <div className="flex flex-1 overflow-hidden">
                {/* Results panel takes the hero position (left, wider) */}
                <div className="flex-1 overflow-hidden">
                  <ResultsPanel
                    result={store.currentResult!}
                    monteCarloResult={store.monteCarloResult}
                    xpEarned={xpEarned}
                    onSave={handleSave}
                    onRerun={handleRerun}
                  />
                </div>

                {/* Chart as companion on the right */}
                <div className="w-[420px] flex-shrink-0 border-l border-border/40">
                  <BacktestChart
                    bars={chartBars}
                    trades={chartTrades}
                    isRunning={isRunning}
                    isPreview={false}
                    onRegenerate={handleRegenerate}
                  />
                </div>
              </div>
              </>
            ) : (
              /* ── Builder-first layout (no results) ──────────────────── */
              <div className="flex flex-1 overflow-hidden">
                {/* Left: Strategy Panel — front and center */}
                <div className="flex flex-col overflow-hidden">
                  <StrategyPanel
                    onRun={handleRun}
                    isRunning={isRunning}
                    savedStrategies={store.savedStrategies}
                    onLoadStrategy={handleLoadStrategy}
                    onOpenTemplates={() => setShowTemplates(true)}
                    onPreviewChange={handlePreviewChange}
                    templateConfig={templateConfig}
                    onTemplateConsumed={handleTemplateConsumed}
                  />
                </div>

                {/* Center: Chart + Visual Builder stacked */}
                <div className="flex flex-1 flex-col overflow-hidden">
                  {/* Visual Strategy Builder at top */}
                  <div className="border-b border-border/40 overflow-y-auto" style={{ maxHeight: "50%" }}>
                    <div className="p-4">
                      <VisualStrategyBuilder
                        savedStrategies={visualSavedStrategies}
                        onSaveStrategy={handleSaveVisualStrategy}
                        onRunCustomBacktest={handleRunCustomBacktest}
                      />
                    </div>
                  </div>

                  {/* Chart below */}
                  <div className="flex-1 overflow-hidden">
                    <BacktestChart
                      bars={chartBars}
                      trades={chartTrades}
                      isRunning={isRunning}
                      isPreview={isPreview}
                      onRegenerate={handleRegenerate}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Event Analysis — hero tier */}
        {activeTab === "earnings" && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-foreground">Earnings Event Analysis</h2>
                    <p className="text-xs text-muted-foreground">Historical earnings reactions and pattern detection</p>
                  </div>
                  <EarningsTickerSelect
                    tickers={tickerOptions}
                    selected={earningsTicker}
                    onSelect={(t) => {
                      // Update via store or local state
                    }}
                  />
                </div>
                <EarningsAnalysis ticker={earningsTicker} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Monte Carlo */}
        {activeTab === "montecarlo" && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mx-auto max-w-3xl">
                <MonteCarloPanelV2
                  result={store.monteCarloResult}
                  startingCapital={store.currentResult?.config.startingCapital ?? 10000}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Walk-Forward */}
        {activeTab === "walkforward" && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mx-auto max-w-3xl space-y-4">
                <div className="mb-4">
                  <h2 className="text-sm font-bold text-foreground">Walk-Forward Analysis</h2>
                  <p className="text-xs text-muted-foreground">
                    Measures how well in-sample performance translates to out-of-sample results across multiple folds
                  </p>
                </div>
                <WalkForwardPanel result={walkForwardResult} isRunning={isRunning} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Optimization */}
        {activeTab === "optimization" && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mx-auto max-w-4xl space-y-4">
                <div className="mb-4">
                  <h2 className="text-sm font-bold text-foreground">Parameter Optimization</h2>
                  <p className="text-xs text-muted-foreground">
                    Grid search over parameter combinations to find the highest Sharpe ratio
                  </p>
                </div>
                <OptimizationPanel savedStrategies={visualSavedStrategies} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Strategy Template Gallery Overlay */}
      <AnimatePresence>
        {showTemplates && (
          <StrategyTemplateGallery
            onSelect={handleTemplateSelect}
            onClose={() => setShowTemplates(false)}
          />
        )}
      </AnimatePresence>

      {/* Confetti overlay */}
      <Confetti show={showConfetti} />
    </div>
  );
}

// ── Earnings Ticker Select ─────────────────────────────────────────────────

function EarningsTickerSelect({
  tickers,
  selected,
  onSelect,
}: {
  tickers: string[];
  selected: string;
  onSelect: (t: string) => void;
}) {
  return (
    <select
      value={selected}
      onChange={(e) => onSelect(e.target.value)}
      className="appearance-none rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
    >
      {tickers.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
  );
}
