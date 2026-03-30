"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSettingsStore } from "@/stores/settings-store";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ResetConfirmDialog } from "@/components/settings/ResetConfirmDialog";
import { usePreferencesStore, type Difficulty } from "@/stores/preferences-store";
import { Settings, Volume2, RotateCcw, GraduationCap, AlertTriangle, Shield, Sparkles, Gamepad2, Bell, Eye } from "lucide-react";

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; desc: string; color: string; bg: string }[] = [
  { value: "easy", label: "Easy", desc: "Lower volatility, gentler markets", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  { value: "normal", label: "Normal", desc: "Realistic market conditions", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { value: "hard", label: "Hard", desc: "High volatility, brutal swings", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
];

const NOTIFICATION_LABELS: Record<string, string> = {
  achievement: "Achievements",
  level_up: "Level Ups",
  trade: "Trades",
  quest: "Quests",
  arena: "Arena",
  challenge: "Challenges",
  xp: "XP Gains",
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
} as const;
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
};

export default function SettingsPage() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const volume = useSettingsStore((s) => s.volume);
  const toggleSound = useSettingsStore((s) => s.toggleSound);
  const setVolume = useSettingsStore((s) => s.setVolume);
  const setTutorialCompleted = useSettingsStore((s) => s.setTutorialCompleted);
  const setTutorialStep = useSettingsStore((s) => s.setTutorialStep);
  const resetGame = useGameStore((s) => s.resetGame);
  const resetPortfolio = useTradingStore((s) => s.resetPortfolio);
  const level = useGameStore((s) => s.level);
  const title = useGameStore((s) => s.title);
  const difficulty = usePreferencesStore((s) => s.difficulty);
  const setDifficulty = usePreferencesStore((s) => s.setDifficulty);
  const colorblindMode = usePreferencesStore((s) => s.colorblindMode);
  const setColorblindMode = usePreferencesStore((s) => s.setColorblindMode);
  const notifPrefs = usePreferencesStore((s) => s.notificationPreferences);
  const setNotifPref = usePreferencesStore((s) => s.setNotificationPreference);
  const [resetTarget, setResetTarget] = useState<"game" | "portfolio" | null>(null);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <motion.div
        className="space-y-5 p-6 max-w-xl"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/20"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </motion.div>
          <div>
            <h1 className="text-lg font-black">Settings</h1>
            <p className="text-[10px] text-muted-foreground">Customize your experience</p>
          </div>
          <div className="flex-1" />
          <div className="badge-premium flex items-center gap-1.5 rounded-lg px-2.5 py-1.5">
            <Shield className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold text-primary">Lv.{level} {title}</span>
          </div>
        </motion.div>

        {/* Sound Section */}
        <motion.div variants={fadeUp} className="card-hover-glow rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-black">
            <Volume2 className="h-4 w-4 text-blue-400" />
            Sound Effects
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Enable Sounds</div>
                <div className="text-[10px] text-muted-foreground">
                  Audio feedback for trades, achievements, and interactions
                </div>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={toggleSound} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Volume</span>
                <span className="text-xs tabular-nums text-muted-foreground font-bold">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input
                aria-label="Volume"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="time-slider w-full"
                disabled={!soundEnabled}
              />
            </div>
          </div>
        </motion.div>

        {/* Tutorial Section */}
        <motion.div variants={fadeUp} className="card-hover-glow rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-black">
            <GraduationCap className="h-4 w-4 text-amber-400" />
            Tutorial
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Replay Tutorial</div>
              <div className="text-[10px] text-muted-foreground">
                Walk through the guided tour from the beginning
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTutorialCompleted(false);
                setTutorialStep(0);
                window.location.href = "/trade";
              }}
            >
              <RotateCcw className="mr-1.5 h-3 w-3" />
              Replay
            </Button>
          </div>
        </motion.div>

        {/* Difficulty */}
        <motion.div variants={fadeUp} className="card-hover-glow rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-black">
            <Gamepad2 className="h-4 w-4 text-violet-400" />
            Difficulty
          </div>
          <p className="mb-3 text-[10px] text-muted-foreground">
            Adjusts market volatility in the trading simulator
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDifficulty(opt.value)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-all cursor-pointer",
                  difficulty === opt.value
                    ? `${opt.bg} ${opt.color} ring-1 ring-current`
                    : "border-border bg-card/50 text-muted-foreground hover:bg-accent hover:border-border/60",
                )}
              >
                <div className="text-sm font-bold">{opt.label}</div>
                <div className="text-[9px] opacity-70">{opt.desc}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={fadeUp} className="card-hover-glow rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-black">
            <Bell className="h-4 w-4 text-cyan-400" />
            Notifications
          </div>
          <div className="space-y-3">
            {Object.entries(NOTIFICATION_LABELS).map(([type, label]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm font-medium">{label}</span>
                <Switch
                  checked={notifPrefs[type as keyof typeof notifPrefs] ?? true}
                  onCheckedChange={(v) => setNotifPref(type as keyof typeof notifPrefs, v)}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Accessibility */}
        <motion.div variants={fadeUp} className="card-hover-glow rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-black">
            <Eye className="h-4 w-4 text-teal-400" />
            Accessibility
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Colorblind Mode</div>
              <div className="text-[10px] text-muted-foreground">
                Uses blue/orange instead of green/red for profit/loss
              </div>
            </div>
            <Switch checked={colorblindMode} onCheckedChange={setColorblindMode} />
          </div>
        </motion.div>

        {/* About */}
        <motion.div variants={fadeUp} className="rounded-lg border border-primary/15 bg-primary/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-black text-primary">Alpha Deck</span>
          </div>
          <p className="text-[11px] text-primary/70 leading-relaxed">
            A gamified stock trading simulator designed to teach you the fundamentals
            of investing — no real money, all the knowledge.
          </p>
        </motion.div>

        {/* Reset Section */}
        <motion.div variants={fadeUp} className="rounded-lg border border-destructive/20 bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-black text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Reset Game Progress</div>
                <div className="text-[10px] text-muted-foreground">
                  Reset XP, level, and all achievements to zero
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={() => setResetTarget("game")}
              >
                Reset XP
              </Button>
            </div>

            <div className="divider-glow" />

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Reset Portfolio</div>
                <div className="text-[10px] text-muted-foreground">
                  Clear all positions, trades, and reset cash to $100,000
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={() => setResetTarget("portfolio")}
              >
                Reset Portfolio
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <ResetConfirmDialog
        open={resetTarget === "game"}
        onConfirm={() => { resetGame(); setResetTarget(null); }}
        onCancel={() => setResetTarget(null)}
        title="Reset Game Progress"
        description="This will permanently reset your XP, level, and all achievements to zero. This action cannot be undone."
        confirmLabel="Reset XP"
      />
      <ResetConfirmDialog
        open={resetTarget === "portfolio"}
        onConfirm={() => { resetPortfolio(); setResetTarget(null); }}
        onCancel={() => setResetTarget(null)}
        title="Reset Portfolio"
        description="This will clear all positions, trade history, and reset your cash to $100,000. This action cannot be undone."
        confirmLabel="Reset Portfolio"
      />
    </div>
  );
}
