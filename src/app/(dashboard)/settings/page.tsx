"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { useTradingPreferencesStore } from "@/stores/trading-preferences-store";
import { useProfileStore } from "@/stores/profile-store";
import type {
  DefaultOrderType,
  DefaultInstrument,
  ChartStyle,
  DefaultTimeframe,
  AppTheme,
  PnLColorScheme,
  RiskTolerance,
  TradingExperience,
  InvestmentGoal,
} from "@/stores/trading-preferences-store";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResetConfirmDialog } from "@/components/settings/ResetConfirmDialog";
import { DataManager } from "@/components/settings/DataManager";
import {
  Settings,
  BarChart2,
  Monitor,
  Bell,
  User,
  Database,
  Shield,
  AlertTriangle,
  Keyboard,
  Info,
  Check,
} from "lucide-react";

// ── Shared primitives ─────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-bold text-muted-foreground pb-1">
      {children}
    </div>
  );
}

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
    <div className="flex items-center justify-between gap-4 py-0.5">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 space-y-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

function NativeSelect<T extends string | number>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => {
        const raw = e.target.value;
        const coerced =
          typeof value === "number" ? (Number(raw) as T) : (raw as T);
        onChange(coerced);
      }}
      className={cn(
        "h-8 rounded-md border border-border bg-card px-2 pr-7 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer",
        className,
      )}
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

function RadioCards<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; description?: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex flex-col items-start rounded-md border px-3 py-2 text-left text-xs text-muted-foreground transition-all",
            value === opt.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-accent",
          )}
        >
          <span className="font-medium">{opt.label}</span>
          {opt.description && (
            <span className="text-xs text-muted-foreground opacity-70 mt-0.5">
              {opt.description}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function RangeSlider({
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
}) {
  const label = formatValue ? formatValue(value) : String(value);
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="time-slider w-28"
      />
      <span className="w-12 text-right text-xs font-bold tabular-nums text-foreground">
        {label}
      </span>
    </div>
  );
}

function CheckboxItem({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-start gap-2.5 rounded-md border px-3 py-2 text-left text-xs text-muted-foreground transition-all w-full",
        checked
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card hover:bg-accent",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/40",
        )}
      >
        {checked && <Check className="h-2.5 w-2.5" />}
      </div>
      <div>
        <div className="font-medium text-foreground">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-0.5">
            {description}
          </div>
        )}
      </div>
    </button>
  );
}

// ── Tab 1: Trading ────────────────────────────────────────────────────────────

function TradingTab() {
  const {
    defaultOrderType,
    setDefaultOrderType,
    defaultQuantity,
    setDefaultQuantity,
    showTradeConfirmation,
    setShowTradeConfirmation,
    proMode,
    setProMode,
    defaultInstrument,
    setDefaultInstrument,
    riskPerTradePct,
    setRiskPerTradePct,
    maxDailyLossLimit,
    setMaxDailyLossLimit,
    autoStopAtDailyLoss,
    setAutoStopAtDailyLoss,
  } = useTradingPreferencesStore();

  const [lossInput, setLossInput] = useState(String(maxDailyLossLimit));

  const orderTypeOptions: { value: DefaultOrderType; label: string }[] = [
    { value: "market", label: "Market" },
    { value: "limit", label: "Limit" },
    { value: "stop", label: "Stop" },
    { value: "stop-limit", label: "Stop-Limit" },
  ];

  const instrumentOptions: { value: DefaultInstrument; label: string }[] = [
    { value: "stock", label: "Stock" },
    { value: "options", label: "Options" },
    { value: "crypto", label: "Crypto" },
  ];

  function commitLossLimit() {
    const val = parseFloat(lossInput);
    if (!isNaN(val) && val >= 0) {
      setMaxDailyLossLimit(val);
      toast.success("Daily loss limit updated");
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader>Order Defaults</SectionHeader>
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
        <Separator className="opacity-30" />
        <SettingRow
          label="Default Quantity"
          description="Pre-filled share/contract quantity in order entry"
        >
          <Input
            type="number"
            min={1}
            max={10000}
            value={defaultQuantity}
            onChange={(e) => setDefaultQuantity(Number(e.target.value))}
            className="h-8 w-24 text-xs text-muted-foreground"
          />
        </SettingRow>
        <Separator className="opacity-30" />
        <SettingRow
          label="Default Instrument"
          description="Default trading instrument when opening trade panel"
        >
          <NativeSelect
            value={defaultInstrument}
            onChange={(v) => setDefaultInstrument(v as DefaultInstrument)}
            options={instrumentOptions}
          />
        </SettingRow>
      </Card>

      <Card>
        <SectionHeader>Risk Management</SectionHeader>
        <SettingRow
          label="Risk Per Trade"
          description={`${riskPerTradePct.toFixed(1)}% of account at risk per position`}
        >
          <RangeSlider
            value={riskPerTradePct}
            min={0.5}
            max={5}
            step={0.5}
            onChange={setRiskPerTradePct}
            formatValue={(v) => `${v.toFixed(1)}%`}
          />
        </SettingRow>
        <Separator className="opacity-30" />
        <SettingRow
          label="Max Daily Loss Limit"
          description="Stop trading automatically when this loss is reached"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">$</span>
            <Input
              type="number"
              min={0}
              value={lossInput}
              onChange={(e) => setLossInput(e.target.value)}
              onBlur={commitLossLimit}
              onKeyDown={(e) => e.key === "Enter" && commitLossLimit()}
              className="h-8 w-24 text-xs text-muted-foreground"
            />
          </div>
        </SettingRow>
        <Separator className="opacity-30" />
        <SettingRow
          label="Auto-Stop at Daily Loss"
          description="Prevent new trades when daily loss limit is hit"
        >
          <Switch
            checked={autoStopAtDailyLoss}
            onCheckedChange={setAutoStopAtDailyLoss}
          />
        </SettingRow>
      </Card>

      <Card>
        <SectionHeader>Execution</SectionHeader>
        <SettingRow
          label="Confirm Before Trade"
          description="Show a confirmation dialog before executing orders"
        >
          <Switch
            checked={showTradeConfirmation}
            onCheckedChange={setShowTradeConfirmation}
          />
        </SettingRow>
        <Separator className="opacity-30" />
        <SettingRow
          label="Pro Mode"
          description="Enable realistic commission fees on every trade"
        >
          <Switch checked={proMode} onCheckedChange={setProMode} />
        </SettingRow>
      </Card>
    </div>
  );
}

// ── Tab 2: Display ────────────────────────────────────────────────────────────

function DisplayTab() {
  const {
    appTheme,
    setAppTheme,
    chartStyle,
    setChartStyle,
    defaultTimeframe,
    setDefaultTimeframe,
    showVolume,
    setShowVolume,
    showGridLines,
    setShowGridLines,
    chartAnimation,
    setChartAnimation,
    compactMode,
    setCompactMode,
    pnlColorScheme,
    setPnlColorScheme,
  } = useTradingPreferencesStore();

  const themeOptions: { value: AppTheme; label: string; description: string }[] = [
    { value: "dark", label: "Dark", description: "Dark background" },
    { value: "light", label: "Light", description: "Light background" },
    { value: "system", label: "System", description: "Follows OS setting" },
  ];

  const chartStyleOptions: { value: ChartStyle; label: string }[] = [
    { value: "candlestick", label: "Candlestick" },
    { value: "ohlc", label: "OHLC Bars" },
    { value: "line", label: "Line" },
    { value: "area", label: "Area" },
  ];

  const timeframeOptions: { value: DefaultTimeframe; label: string }[] = [
    { value: "5m", label: "5 min" },
    { value: "15m", label: "15 min" },
    { value: "1h", label: "1 hour" },
    { value: "1d", label: "1 Day" },
    { value: "1wk", label: "1 Week" },
  ];

  const pnlSchemeOptions: {
    value: PnLColorScheme;
    label: string;
    description: string;
  }[] = [
    {
      value: "default",
      label: "Green / Red",
      description: "Standard color coding",
    },
    {
      value: "colorblind",
      label: "Blue / Orange",
      description: "Colorblind-friendly",
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader>Theme</SectionHeader>
        <SettingRow
          label="App Theme"
          description="Cosmetic theme preference (dark-first design)"
        >
          <RadioCards
            value={appTheme}
            onChange={setAppTheme}
            options={themeOptions}
          />
        </SettingRow>
      </Card>

      <Card>
        <SectionHeader>Chart</SectionHeader>
        <SettingRow
          label="Chart Style"
          description="Default rendering style for price data"
        >
          <NativeSelect
            value={chartStyle}
            onChange={(v) => setChartStyle(v as ChartStyle)}
            options={chartStyleOptions}
          />
        </SettingRow>
        <Separator className="opacity-30" />
        <SettingRow
          label="Default Timeframe"
          description="Initial timeframe when loading a chart"
        >
          <NativeSelect
            value={defaultTimeframe}
            onChange={(v) => setDefaultTimeframe(v as DefaultTimeframe)}
            options={timeframeOptions}
          />
        </SettingRow>
        <Separator className="opacity-30" />
        <SettingRow label="Show Volume" description="Display volume bars below the main chart">
          <Switch checked={showVolume} onCheckedChange={setShowVolume} />
        </SettingRow>
        <Separator className="opacity-30" />
        <SettingRow
          label="Show Grid Lines"
          description="Horizontal and vertical grid lines on the chart"
        >
          <Switch checked={showGridLines} onCheckedChange={setShowGridLines} />
        </SettingRow>
        <Separator className="opacity-30" />
        <SettingRow
          label="Chart Animation"
          description="Smooth transitions when data updates"
        >
          <Switch
            checked={chartAnimation}
            onCheckedChange={setChartAnimation}
          />
        </SettingRow>
      </Card>

      <Card>
        <SectionHeader>Layout</SectionHeader>
        <SettingRow
          label="Compact Mode"
          description="Reduce padding and spacing across the dashboard"
        >
          <Switch checked={compactMode} onCheckedChange={setCompactMode} />
        </SettingRow>
      </Card>

      <Card>
        <SectionHeader>P&L Color Scheme</SectionHeader>
        <RadioCards
          value={pnlColorScheme}
          onChange={setPnlColorScheme}
          options={pnlSchemeOptions}
        />
      </Card>
    </div>
  );
}

// ── Tab 3: Notifications ──────────────────────────────────────────────────────

function NotificationsTab() {
  const {
    priceAlertsEnabled,
    setPriceAlertsEnabled,
    achievementAlertsEnabled,
    setAchievementAlertsEnabled,
    levelUpAlertsEnabled,
    setLevelUpAlertsEnabled,
    dailyReminderEnabled,
    setDailyReminderEnabled,
    dailyReminderHour,
    setDailyReminderHour,
    aiCoachSuggestionsEnabled,
    setAiCoachSuggestionsEnabled,
    soundEffectsEnabled,
    setSoundEffectsEnabled,
    soundVolume,
    setSoundVolume,
  } = useTradingPreferencesStore();

  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const label =
      i === 0
        ? "12:00 AM"
        : i < 12
          ? `${i}:00 AM`
          : i === 12
            ? "12:00 PM"
            : `${i - 12}:00 PM`;
    return { value: i, label };
  });

  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader>Alert Types</SectionHeader>
        <SettingRow
          label="Price Alerts"
          description="Notify when watchlist price targets are hit"
        >
          <Switch
            checked={priceAlertsEnabled}
            onCheckedChange={setPriceAlertsEnabled}
          />
        </SettingRow>
        <Separator className="opacity-30" />
        <SettingRow
          label="Achievement Alerts"
          description="Show popup when a new achievement is unlocked"
        >
          <Switch
            checked={achievementAlertsEnabled}
            onCheckedChange={setAchievementAlertsEnabled}
          />
        </SettingRow>
        <Separator className="opacity-30" />
        <SettingRow
          label="Level Up Alerts"
          description="Celebrate when you reach a new level"
        >
          <Switch
            checked={levelUpAlertsEnabled}
            onCheckedChange={setLevelUpAlertsEnabled}
          />
        </SettingRow>
        <Separator className="opacity-30" />
        <SettingRow
          label="AI Coach Suggestions"
          description="Show trade setup suggestions from AlphaBot"
        >
          <Switch
            checked={aiCoachSuggestionsEnabled}
            onCheckedChange={setAiCoachSuggestionsEnabled}
          />
        </SettingRow>
      </Card>

      <Card>
        <SectionHeader>Daily Reminder</SectionHeader>
        <SettingRow
          label="Daily Reminder"
          description="Receive a daily prompt to check the markets"
        >
          <Switch
            checked={dailyReminderEnabled}
            onCheckedChange={setDailyReminderEnabled}
          />
        </SettingRow>
        {dailyReminderEnabled && (
          <>
            <Separator className="opacity-30" />
            <SettingRow label="Reminder Time" description="Hour to send the daily reminder">
              <NativeSelect
                value={dailyReminderHour}
                onChange={(v) => setDailyReminderHour(Number(v))}
                options={hourOptions}
                className="w-32"
              />
            </SettingRow>
          </>
        )}
      </Card>

      <Card>
        <SectionHeader>Sound</SectionHeader>
        <SettingRow
          label="Sound Effects"
          description="Play audio feedback for trades and events"
        >
          <Switch
            checked={soundEffectsEnabled}
            onCheckedChange={setSoundEffectsEnabled}
          />
        </SettingRow>
        {soundEffectsEnabled && (
          <>
            <Separator className="opacity-30" />
            <SettingRow
              label="Volume"
              description={`${soundVolume}% audio level`}
            >
              <RangeSlider
                value={soundVolume}
                min={0}
                max={100}
                step={5}
                onChange={setSoundVolume}
                formatValue={(v) => `${v}%`}
              />
            </SettingRow>
          </>
        )}
      </Card>
    </div>
  );
}

// ── Tab 4: Account ────────────────────────────────────────────────────────────

function AccountTab() {
  const displayName = useProfileStore((s) => s.displayName);
  const setDisplayName = useProfileStore((s) => s.setDisplayName);
  const {
    tradingExperience,
    setTradingExperience,
    riskTolerance,
    setRiskTolerance,
    investmentGoals,
    toggleInvestmentGoal,
  } = useTradingPreferencesStore();

  const resetGame = useGameStore((s) => s.resetGame);
  const resetPortfolio = useTradingStore((s) => s.resetPortfolio);
  const [resetTarget, setResetTarget] = useState<"game" | null>(null);
  const [nameInput, setNameInput] = useState(displayName);

  const experienceOptions: { value: TradingExperience; label: string }[] = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
    { value: "expert", label: "Expert" },
  ];

  const riskOptions: {
    value: RiskTolerance;
    label: string;
    description: string;
  }[] = [
    {
      value: "conservative",
      label: "Conservative",
      description: "Capital preservation",
    },
    {
      value: "moderate",
      label: "Moderate",
      description: "Balanced growth",
    },
    {
      value: "aggressive",
      label: "Aggressive",
      description: "Maximum growth",
    },
  ];

  const goalOptions: {
    value: InvestmentGoal;
    label: string;
    description: string;
  }[] = [
    {
      value: "learn",
      label: "Learn to Trade",
      description: "Build foundational knowledge",
    },
    {
      value: "wealth",
      label: "Build Wealth",
      description: "Long-term capital growth",
    },
    {
      value: "income",
      label: "Generate Income",
      description: "Dividends and cash flow",
    },
    {
      value: "speculation",
      label: "Speculation",
      description: "High-risk, high-reward trades",
    },
  ];

  function commitName() {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== displayName) {
      setDisplayName(trimmed);
      toast.success("Display name updated");
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader>Profile</SectionHeader>
        <SettingRow
          label="Display Name"
          description="Your name shown on leaderboards and trade cards"
        >
          <Input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => e.key === "Enter" && commitName()}
            maxLength={20}
            placeholder="Trader"
            className="h-8 w-36 text-xs text-muted-foreground"
          />
        </SettingRow>
        <Separator className="opacity-30" />
        <SettingRow
          label="Trading Experience"
          description="Helps personalize AI coach recommendations"
        >
          <NativeSelect
            value={tradingExperience}
            onChange={(v) => setTradingExperience(v as TradingExperience)}
            options={experienceOptions}
          />
        </SettingRow>
      </Card>

      <Card>
        <SectionHeader>Risk Tolerance</SectionHeader>
        <RadioCards
          value={riskTolerance}
          onChange={setRiskTolerance}
          options={riskOptions}
        />
      </Card>

      <Card>
        <SectionHeader>Investment Goals</SectionHeader>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {goalOptions.map((opt) => (
            <CheckboxItem
              key={opt.value}
              checked={investmentGoals.includes(opt.value)}
              onChange={() => toggleInvestmentGoal(opt.value)}
              label={opt.label}
              description={opt.description}
            />
          ))}
        </div>
      </Card>

      <Card className="border-destructive/20 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-destructive">
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
            className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs"
            onClick={() => setResetTarget("game")}
          >
            Reset Progress
          </Button>
        </SettingRow>
        <Separator className="opacity-30" />
        <SettingRow
          label="Reset Portfolio"
          description="Clear all positions and reset cash to $100,000"
        >
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs"
            onClick={() => {
              resetPortfolio();
              toast.success("Portfolio reset to $100,000");
            }}
          >
            Reset Portfolio
          </Button>
        </SettingRow>
      </Card>

      <ResetConfirmDialog
        open={resetTarget === "game"}
        onConfirm={() => {
          resetGame();
          setResetTarget(null);
          toast.success("Game progress reset");
        }}
        onCancel={() => setResetTarget(null)}
        title="Reset Game Progress"
        description="This will permanently reset your XP, level, and all achievements to zero. This action cannot be undone."
        confirmLabel="Reset Progress"
      />
    </div>
  );
}

// ── Tab 5: Data ───────────────────────────────────────────────────────────────

const KEYBOARD_SHORTCUTS: { key: string; description: string; context: string }[] = [
  { key: "B", description: "Place buy order", context: "Trade panel" },
  { key: "S", description: "Place sell order", context: "Trade panel" },
  { key: "Space", description: "Play / Pause time travel", context: "Chart" },
  { key: "Arrow Right", description: "Advance one bar", context: "Chart" },
  { key: "Arrow Left", description: "Go back one bar", context: "Chart" },
  { key: "R", description: "Reset to latest bar", context: "Chart" },
  { key: "1–5", description: "Switch timeframe (5m/15m/1h/1D/1W)", context: "Chart" },
  { key: "Esc", description: "Close modal or panel", context: "Global" },
  { key: "Ctrl + Z", description: "Undo last action (where supported)", context: "Global" },
  { key: "/ (Slash)", description: "Open global search", context: "Global" },
  { key: "G then T", description: "Navigate to Trade page", context: "Navigation" },
  { key: "G then L", description: "Navigate to Learn page", context: "Navigation" },
  { key: "G then P", description: "Navigate to Portfolio page", context: "Navigation" },
  { key: "G then S", description: "Navigate to Settings page", context: "Navigation" },
];

const APP_FEATURES: string[] = [
  "Simulated market data with intraday 5m/15m/1h/1D/1W timeframes",
  "Options chain with full Greeks, strategy builder, and unusual activity feed",
  "AI coach (AlphaBot) with 50+ technical signals and named trade setups",
  "Prediction markets with live scoring and leaderboard",
  "Quant backtester with walk-forward validation",
  "Adaptive flashcard system with spaced repetition",
  "XP, leveling, achievements, daily streaks, and seasonal rewards",
  "Institutional holdings, insider trading, and news sentiment panels",
  "Journal and trade replay for post-session review",
  "Import / export all data as JSON or CSV",
];

function DataTab() {
  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-2 text-xs font-medium text-muted-foreground">
          Import / Export
        </div>
        <DataManager />
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Keyboard className="h-4 w-4 text-muted-foreground" />
          <SectionHeader>Keyboard Shortcuts</SectionHeader>
        </div>
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground">
                  Key
                </th>
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground">
                  Action
                </th>
                <th className="hidden px-3 py-2 text-left font-semibold text-muted-foreground sm:table-cell">
                  Context
                </th>
              </tr>
            </thead>
            <tbody>
              {KEYBOARD_SHORTCUTS.map((s, i) => (
                <tr
                  key={i}
                  className={cn(
                    "border-b border-border/50 last:border-0",
                    i % 2 === 0 ? "bg-card" : "bg-muted/10",
                  )}
                >
                  <td className="px-3 py-2">
                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground font-medium">
                      {s.key}
                    </kbd>
                  </td>
                  <td className="px-3 py-2 text-foreground">{s.description}</td>
                  <td className="hidden px-3 py-2 text-muted-foreground sm:table-cell">
                    {s.context}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-muted-foreground" />
          <SectionHeader>About FinSim</SectionHeader>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-1 text-xs text-muted-foreground mb-4">
          <span>
            Version{" "}
            <span className="font-medium text-foreground">v3.3.0</span>
          </span>
          <span>
            Build date{" "}
            <span className="font-medium text-foreground">2026-03-27</span>
          </span>
          <span>
            Platform{" "}
            <span className="font-medium text-foreground">Next.js 16 / Turbopack</span>
          </span>
        </div>
        <Separator className="opacity-30 mb-4" />
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Features
        </div>
        <ul className="space-y-1.5">
          {APP_FEATURES.map((feat, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
              {feat}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const level = useGameStore((s) => s.level);
  const title = useGameStore((s) => s.title);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="space-y-5 p-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-l-4 border-l-primary p-6 rounded-lg bg-card/40">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <Settings className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-medium">Settings</h1>
            <p className="text-xs text-muted-foreground">
              Customize your trading experience
            </p>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5">
            <Shield className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-primary">
              Lv.{level} {title}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="trading">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="trading" className="gap-1.5 text-xs text-muted-foreground">
              <BarChart2 className="h-3.5 w-3.5" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="display" className="gap-1.5 text-xs text-muted-foreground">
              <Monitor className="h-3.5 w-3.5" />
              Display
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5 text-xs text-muted-foreground">
              <Bell className="h-3.5 w-3.5" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-1.5 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              Account
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-1.5 text-xs text-muted-foreground">
              <Database className="h-3.5 w-3.5" />
              Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trading" className="mt-4">
            <TradingTab />
          </TabsContent>

          <TabsContent value="display" className="mt-4">
            <DisplayTab />
          </TabsContent>

          <TabsContent value="notifications" className="mt-4">
            <NotificationsTab />
          </TabsContent>

          <TabsContent value="account" className="mt-4">
            <AccountTab />
          </TabsContent>

          <TabsContent value="data" className="mt-4">
            <DataTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
