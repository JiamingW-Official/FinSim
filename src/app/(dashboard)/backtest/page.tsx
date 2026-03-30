"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { FlaskConical, Pencil } from "lucide-react";
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
 <div className="flex h-full flex-col overflow-y-auto">
 {/* Header */}
 <div className="px-6 pt-8 pb-0 shrink-0">
 <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Backtesting</h1>
 <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-4">HISTORICAL · STRATEGY · PERFORMANCE</p>
 {store.totalBacktestsRun > 0 && (
 <p className="text-[11px] font-mono text-muted-foreground/30 mb-2">{store.totalBacktestsRun} runs · {store.savedStrategies.length} saved</p>
 )}
 </div>

 {/* Tab Bar */}
 <div className="flex border-b border-border px-5">
 {TABS.map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`px-4 pb-2 pt-3 text-xs font-medium transition-colors border-b-2 ${
 activeTab === tab.id
 ? "border-foreground text-foreground font-semibold"
 : "border-transparent text-muted-foreground/50 hover:text-muted-foreground"
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
 {hasResult && (
 <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-2">
 <span className="flex-1 truncate text-xs font-mono text-muted-foreground">
 {configSummary}
 </span>
 <button
 onClick={() => setEditorExpanded(!editorExpanded)}
 className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
 >
 <Pencil className="h-3 w-3" />
 {editorExpanded ? "Close" : "Edit"}
 </button>
 </div>
 )}

 {/* (Editor sidebar is shown inline via the left sidebar when editorExpanded is true) */}

 {/* Main content area — sidebar config + dominant results */}
 <div className="flex flex-1 overflow-hidden">
 {/* Left: Strategy config sidebar (fixed width) */}
 {(!hasResult || editorExpanded) && (
 <div className="w-[320px] flex-shrink-0 overflow-y-auto border-r border-border">
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
 )}

 {/* Right: Results area (flex-1, takes remaining space) */}
 <div className="flex flex-1 flex-col overflow-hidden">
 {hasResult ? (
 <>
 {/* Chart row */}
 <div className="h-[260px] flex-shrink-0 border-b border-border overflow-hidden">
 <BacktestChart
 bars={chartBars}
 trades={chartTrades}
 isRunning={isRunning}
 isPreview={false}
 onRegenerate={handleRegenerate}
 />
 </div>
 {/* Results panel — dominant */}
 <div className="flex-1 overflow-hidden">
 <ResultsPanel
 result={store.currentResult!}
 monteCarloResult={store.monteCarloResult}
 xpEarned={xpEarned}
 onSave={handleSave}
 onRerun={handleRerun}
 />
 </div>
 </>
 ) : (
 <>
 {/* Preview chart */}
 <div className="flex-1 overflow-hidden">
 <BacktestChart
 bars={chartBars}
 trades={chartTrades}
 isRunning={isRunning}
 isPreview={isPreview}
 onRegenerate={handleRegenerate}
 />
 </div>
 {/* Empty state message */}
 <div className="flex flex-col items-center justify-center border-t border-border py-12 text-center">
 <FlaskConical className="h-8 w-8 text-muted-foreground/30 mb-3" />
 <p className="text-sm font-medium text-muted-foreground">Configure a strategy and run a backtest</p>
 <p className="mt-1 text-xs text-muted-foreground">Results will appear here with grade, equity curve, and performance metrics</p>
 </div>
 {/* Visual Strategy Builder */}
 <div className="border-t border-border overflow-y-auto" style={{ maxHeight: "35%" }}>
 <div className="p-3">
 <VisualStrategyBuilder
 savedStrategies={visualSavedStrategies}
 onSaveStrategy={handleSaveVisualStrategy}
 onRunCustomBacktest={handleRunCustomBacktest}
 />
 </div>
 </div>
 </>
 )}
 </div>
 </div>
 </div>
 )}

 {/* Tab 2: Event Analysis */}
 {activeTab === "earnings" && (
 <div className="flex flex-1 flex-col overflow-hidden">
 <div className="flex-1 overflow-y-auto p-4">
 <div className="mx-auto max-w-4xl space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-sm font-medium text-foreground">Earnings Event Analysis</h2>
 <p className="text-[11px] text-muted-foreground">Historical earnings reactions and pattern detection</p>
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
 <div className="flex-1 overflow-y-auto p-4">
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
 <div className="flex-1 overflow-y-auto p-4">
 <div className="mx-auto max-w-3xl space-y-3">
 <div className="mb-4">
 <h2 className="text-sm font-medium text-foreground">Walk-Forward Analysis</h2>
 <p className="text-[11px] text-muted-foreground">
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
 <div className="flex-1 overflow-y-auto p-4">
 <div className="mx-auto max-w-4xl space-y-3">
 <div className="mb-4">
 <h2 className="text-sm font-medium text-foreground">Parameter Optimization</h2>
 <p className="text-[11px] text-muted-foreground">
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
 className="appearance-none rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-border"
 >
 {tickers.map((t) => (
 <option key={t} value={t}>{t}</option>
 ))}
 </select>
 );
}
