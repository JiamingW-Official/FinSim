"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { useTradingPreferencesStore } from "@/stores/trading-preferences-store";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResetConfirmDialog } from "@/components/settings/ResetConfirmDialog";
import { DataManager } from "@/components/settings/DataManager";
import {
  Settings,
  BarChart2,
  Palette,
  Database,
  Shield,
  AlertTriangle,
} from "lucide-react";

// Local type aliases mirroring the store's exported types
type DefaultOrderType = "market" | "limit" | "stop";
type DecimalPlaces = 2 | 4 | 6;
type SlippageModel = "none" | "low" | "realistic" | "high";
type FontSize = "sm" | "md" | "lg";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
} as const;
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 },
  },
};

// ── Shared UI primitives ──────────────────────────────────────────────────────

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        {description && (
          <div className="text-[10px] text-muted-foreground">{description}</div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function NativeSelect<T extends string | number>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => {
        const raw = e.target.value;
        // Preserve numeric types
        const coerced = typeof value === "number" ? (Number(raw) as T) : (raw as T);
        onChange(coerced);
      }}
      className="h-8 rounded-md border border-border bg-card px-2 pr-7 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%236b7280' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 8px center",
        appearance: "none",
        WebkitAppearance: "none",
      }}
    >
      {options.map((opt) => (
        <option key={String(opt.value)} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ── Tab: Trading ─────────────────────────────────────────────────────────────

function TradingTab() {
  const defaultOrderType = useTradingPreferencesStore((s) => s.defaultOrderType);
  const setDefaultOrderType = useTradingPreferencesStore((s) => s.setDefaultOrderType);
  const defaultPositionSizePct = useTradingPreferencesStore((s) => s.defaultPositionSizePct);
  const setDefaultPositionSizePct = useTradingPreferencesStore((s) => s.setDefaultPositionSizePct);
  const proMode = useTradingPreferencesStore((s) => s.proMode);
  const setProMode = useTradingPreferencesStore((s) => s.setProMode);
  const showTradeConfirmation = useTradingPreferencesStore((s) => s.showTradeConfirmation);
  const setShowTradeConfirmation = useTradingPreferencesStore((s) => s.setShowTradeConfirmation);
  const autoStopLossEnabled = useTradingPreferencesStore((s) => s.autoStopLossEnabled);
  const setAutoStopLossEnabled = useTradingPreferencesStore((s) => s.setAutoStopLossEnabled);
  const autoStopLossPct = useTradingPreferencesStore((s) => s.autoStopLossPct);
  const slippage = useTradingPreferencesStore((s) => s.slippageModel);
  const setSlippage = useTradingPreferencesStore((s) => s.setSlippageModel);
  const showCommissions = useTradingPreferencesStore((s) => s.showCommissions);
  const setShowCommissions = useTradingPreferencesStore((s) => s.setShowCommissions);

  const orderTypeOptions: { value: DefaultOrderType; label: string }[] = [
    { value: "market", label: "Market" },
    { value: "limit", label: "Limit" },
    { value: "stop", label: "Stop" },
  ];

  const slippageOptions: { value: SlippageModel; label: string }[] = [
    { value: "none", label: "None (ideal fills)" },
    { value: "low", label: "Low (0.01–0.05%)" },
    { value: "realistic", label: "Realistic (0.05–0.2%)" },
    { value: "high", label: "High (0.2–0.5%)" },
  ];

  return (
    <motion.div
      className="space-y-4"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Order defaults */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl border border-border bg-card p-4 space-y-4"
      >
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Order Defaults
        </div>

        <SettingRow
          label="Default Order Type"
          description="Pre-selected order type when opening the trade panel"
        >
          <NativeSelect
            value={defaultOrderType}
            onChange={(v) => setDefaultOrderType(v as DefaultOrderType)}
            options={orderTypeOptions}
          />
        </SettingRow>

        <div className="divider-glow" />

        <SettingRow
          label="Default Position Size"
          description={`${defaultPositionSizePct}% of portfolio per trade`}
        >
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1}
              max={25}
              step={1}
              value={defaultPositionSizePct}
              onChange={(e) => setDefaultPositionSizePct(Number(e.target.value))}
              className="time-slider w-24"
            />
            <span className="w-8 text-right text-xs font-bold tabular-nums text-foreground">
              {defaultPositionSizePct}%
            </span>
          </div>
        </SettingRow>
      </motion.div>

      {/* Realism */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl border border-border bg-card p-4 space-y-4"
      >
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Realism
        </div>

        <SettingRow
          label="Pro Mode"
          description="Enables realistic commission fees on every trade"
        >
          <Switch checked={proMode} onCheckedChange={setProMode} />
        </SettingRow>

        <div className="divider-glow" />

        <SettingRow
          label="Show Commissions"
          description="Display commission cost in order entry and trade history"
        >
          <Switch checked={showCommissions} onCheckedChange={setShowCommissions} />
        </SettingRow>

        <div className="divider-glow" />

        <SettingRow
          label="Slippage Model"
          description="Simulated price impact applied when orders are filled"
        >
          <NativeSelect
            value={slippage}
            onChange={setSlippage}
            options={slippageOptions}
          />
        </SettingRow>

        <div className="divider-glow" />

        <SettingRow
          label="Show Trade Confirmation"
          description="Display a confirmation dialog before executing trades"
        >
          <Switch
            checked={showTradeConfirmation}
            onCheckedChange={setShowTradeConfirmation}
          />
        </SettingRow>

        <div className="divider-glow" />

        <SettingRow
          label="Auto Stop-Loss"
          description={`Automatically place a stop ${autoStopLossPct}% below entry`}
        >
          <Switch
            checked={autoStopLossEnabled}
            onCheckedChange={setAutoStopLossEnabled}
          />
        </SettingRow>
      </motion.div>
    </motion.div>
  );
}

// ── Tab: Appearance ───────────────────────────────────────────────────────────

function AppearanceTab() {
  const chartTheme = useTradingPreferencesStore((s) => s.chartTheme);
  const setChartTheme = useTradingPreferencesStore((s) => s.setChartTheme);
  const compactMode = useTradingPreferencesStore((s) => s.compactMode);
  const setCompactMode = useTradingPreferencesStore((s) => s.setCompactMode);
  const animatePageTransitions = useTradingPreferencesStore((s) => s.animatePageTransitions);
  const setAnimatePageTransitions = useTradingPreferencesStore((s) => s.setAnimatePageTransitions);
  const decimalPlaces = useTradingPreferencesStore((s) => s.decimalPlaces);
  const setDecimalPlaces = useTradingPreferencesStore((s) => s.setDecimalPlaces);
  const showPnLAsPct = useTradingPreferencesStore((s) => s.showPnLAsPct);
  const setShowPnLAsPct = useTradingPreferencesStore((s) => s.setShowPnLAsPct);
  const showSidebarLabels = useTradingPreferencesStore((s) => s.showSidebarLabels);
  const setShowSidebarLabels = useTradingPreferencesStore((s) => s.setShowSidebarLabels);

  const fontSize = useTradingPreferencesStore((s) => s.fontSize);
  const setFontSize = useTradingPreferencesStore((s) => s.setFontSize);

  const decimalOptions: { value: DecimalPlaces; label: string }[] = [
    { value: 2, label: "2 decimal places ($0.00)" },
    { value: 4, label: "4 decimal places ($0.0000)" },
    { value: 6, label: "6 decimal places ($0.000000)" },
  ];

  const fontSizeOptions: { value: FontSize; label: string }[] = [
    { value: "sm", label: "Small" },
    { value: "md", label: "Medium (default)" },
    { value: "lg", label: "Large" },
  ];

  return (
    <motion.div
      className="space-y-4"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Theme */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl border border-border bg-card p-4 space-y-4"
      >
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Theme
        </div>

        <SettingRow
          label="Color Theme"
          description="Light / Dark mode for charts and panels"
        >
          <div className="flex gap-1.5">
            {(["dark", "light"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setChartTheme(t)}
                className={cn(
                  "rounded-md border px-3 py-1 text-xs font-medium transition-all",
                  chartTheme === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-accent",
                )}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </SettingRow>

        <div className="divider-glow" />

        <SettingRow
          label="Compact Mode"
          description="Reduce padding and spacing across the dashboard"
        >
          <Switch checked={compactMode} onCheckedChange={setCompactMode} />
        </SettingRow>

        <div className="divider-glow" />

        <SettingRow
          label="Animate Page Transitions"
          description="Smooth fade when navigating between pages"
        >
          <Switch
            checked={animatePageTransitions}
            onCheckedChange={setAnimatePageTransitions}
          />
        </SettingRow>
      </motion.div>

      {/* Font & Display */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl border border-border bg-card p-4 space-y-4"
      >
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Font &amp; Display
        </div>

        <SettingRow
          label="Font Size"
          description="UI text size across the application"
        >
          <NativeSelect
            value={fontSize}
            onChange={setFontSize}
            options={fontSizeOptions}
          />
        </SettingRow>

        <div className="divider-glow" />

        <SettingRow
          label="Price Decimal Places"
          description="Number of decimal places shown for prices and P&L"
        >
          <NativeSelect
            value={decimalPlaces}
            onChange={(v) => setDecimalPlaces(v as DecimalPlaces)}
            options={decimalOptions}
          />
        </SettingRow>

        <div className="divider-glow" />

        <SettingRow
          label="Show P&L as Percentage"
          description="Display profit/loss as % instead of dollar amount"
        >
          <Switch checked={showPnLAsPct} onCheckedChange={setShowPnLAsPct} />
        </SettingRow>

        <div className="divider-glow" />

        <SettingRow
          label="Show Sidebar Labels"
          description="Display text labels next to navigation icons"
        >
          <Switch
            checked={showSidebarLabels}
            onCheckedChange={setShowSidebarLabels}
          />
        </SettingRow>
      </motion.div>
    </motion.div>
  );
}

// ── Tab: Data ─────────────────────────────────────────────────────────────────

function DataTab() {
  const resetGame = useGameStore((s) => s.resetGame);
  const resetPortfolio = useTradingStore((s) => s.resetPortfolio);
  const resetPrefs = useTradingPreferencesStore((s) => s.resetAll);
  const [resetTarget, setResetTarget] = useState<
    "game" | "portfolio" | "all" | null
  >(null);

  function handleClearAll() {
    resetGame();
    resetPortfolio();
    resetPrefs();
    setResetTarget(null);
  }

  return (
    <motion.div
      className="space-y-4"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* DataManager handles export/import */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl border border-border bg-card p-4"
      >
        <div className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Import / Export
        </div>
        <DataManager />
      </motion.div>

      {/* Danger zone */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl border border-destructive/20 bg-card p-4 space-y-3"
      >
        <div className="flex items-center gap-2 text-sm font-black text-destructive">
          <AlertTriangle className="h-4 w-4" />
          Danger Zone
        </div>

        <SettingRow
          label="Reset Game Progress"
          description="Reset XP, level, and all achievements to zero"
        >
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => setResetTarget("game")}
          >
            Reset XP
          </Button>
        </SettingRow>

        <div className="divider-glow" />

        <SettingRow
          label="Reset Portfolio"
          description="Clear all positions, trades, and reset cash to $100,000"
        >
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => setResetTarget("portfolio")}
          >
            Reset Portfolio
          </Button>
        </SettingRow>
      </motion.div>

      <ResetConfirmDialog
        open={resetTarget === "game"}
        onConfirm={() => {
          resetGame();
          setResetTarget(null);
        }}
        onCancel={() => setResetTarget(null)}
        title="Reset Game Progress"
        description="This will permanently reset your XP, level, and all achievements to zero. This action cannot be undone."
        confirmLabel="Reset XP"
      />
      <ResetConfirmDialog
        open={resetTarget === "portfolio"}
        onConfirm={() => {
          resetPortfolio();
          setResetTarget(null);
        }}
        onCancel={() => setResetTarget(null)}
        title="Reset Portfolio"
        description="This will clear all positions, trade history, and reset your cash to $100,000. This action cannot be undone."
        confirmLabel="Reset Portfolio"
      />
      <ResetConfirmDialog
        open={resetTarget === "all"}
        onConfirm={handleClearAll}
        onCancel={() => setResetTarget(null)}
        title="Clear All Data"
        description="This will reset your portfolio, game progress, and all preferences. This action cannot be undone."
        confirmLabel="Clear Everything"
      />
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const level = useGameStore((s) => s.level);
  const title = useGameStore((s) => s.title);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="space-y-5 p-6 max-w-2xl">
        {/* Header */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-500/10">
            <Settings className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <h1 className="text-lg font-black">Settings</h1>
            <p className="text-[10px] text-muted-foreground">
              Customize your experience
            </p>
          </div>
          <div className="flex-1" />
          <div className="badge-premium flex items-center gap-1.5 rounded-lg px-2.5 py-1.5">
            <Shield className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold text-primary">
              Lv.{level} {title}
            </span>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="trading">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="trading" className="gap-1.5">
              <BarChart2 className="h-3.5 w-3.5" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1.5">
              <Palette className="h-3.5 w-3.5" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-1.5">
              <Database className="h-3.5 w-3.5" />
              Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trading" className="mt-4">
            <TradingTab />
          </TabsContent>

          <TabsContent value="appearance" className="mt-4">
            <AppearanceTab />
          </TabsContent>

          <TabsContent value="data" className="mt-4">
            <DataTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
