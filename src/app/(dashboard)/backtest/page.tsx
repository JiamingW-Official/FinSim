"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical } from "lucide-react";
import { useBacktestStore } from "@/stores/backtest-store";
import StrategyPanel from "@/components/backtest/StrategyPanel";
import BacktestChart from "@/components/backtest/BacktestChart";
import ResultsPanel from "@/components/backtest/ResultsPanel";
import StrategyTemplateGallery from "@/components/backtest/StrategyTemplateGallery";
import { Confetti } from "@/components/learn/Confetti";
import { soundEngine } from "@/services/audio/sound-engine";
import { generateRealisticBars } from "@/data/lessons/practice-data";
import { BAR_PRESETS } from "@/services/backtest/bar-presets";
import type { BacktestConfig, BacktestBar, StrategyConfig, BarGenPreset } from "@/types/backtest";

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

export default function BacktestPage() {
  const store = useBacktestStore();
  const [isRunning, setIsRunning] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateConfig, setTemplateConfig] = useState<{
    config: Omit<StrategyConfig, "id" | "name" | "ticker">;
    preset: BarGenPreset;
    bars: number;
  } | null>(null);
  const latestConfigRef = useRef<BacktestConfig | null>(null);

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
      latestConfigRef.current = config;

      // Small delay so the user sees the running state
      setTimeout(() => {
        const result = store.executeBacktest(config);
        setIsRunning(false);

        // Calculate XP earned (mirrors store logic)
        let xp = 20;
        if (result.metrics.totalReturn > 0) xp += 30;
        if (result.metrics.sharpeRatio > 1) xp += 50;
        if (result.metrics.sortinoRatio > 1.5) xp += 25;
        if (config.monteCarloRuns > 0) xp += 15;
        setXpEarned(xp);

        // Sound + confetti
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

  // Decide which bars to show in the chart
  const chartBars = hasResult ? store.currentResult!.bars : previewBars;
  const chartTrades = hasResult ? store.currentResult!.trades : [];
  const isPreview = !hasResult && !isRunning;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/5 bg-black/30 px-6 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15">
          <FlaskConical className="h-4 w-4 text-violet-400" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-zinc-100">Strategy Backtester</h1>
          <p className="text-xs text-zinc-500">Build, test, and optimize trading strategies</p>
        </div>
        {store.totalBacktestsRun > 0 && (
          <div className="ml-auto flex items-center gap-4 text-xs text-zinc-500">
            <span>{store.totalBacktestsRun} backtests run</span>
            <span>{store.savedStrategies.length} saved</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Strategy Panel */}
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

        {/* Center: Chart */}
        <BacktestChart
          bars={chartBars}
          trades={chartTrades}
          isRunning={isRunning}
          isPreview={isPreview}
          onRegenerate={handleRegenerate}
        />

        {/* Right: Results Panel (shown when results available) */}
        <AnimatePresence>
          {hasResult && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="overflow-hidden"
            >
              <ResultsPanel
                result={store.currentResult!}
                monteCarloResult={store.monteCarloResult}
                xpEarned={xpEarned}
                onSave={handleSave}
                onRerun={handleRerun}
              />
            </motion.div>
          )}
        </AnimatePresence>
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
