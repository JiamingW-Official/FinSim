"use client";

import { useSettingsStore } from "@/stores/settings-store";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings, Volume2, RotateCcw, GraduationCap } from "lucide-react";

export default function SettingsPage() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const volume = useSettingsStore((s) => s.volume);
  const toggleSound = useSettingsStore((s) => s.toggleSound);
  const setVolume = useSettingsStore((s) => s.setVolume);
  const setTutorialCompleted = useSettingsStore((s) => s.setTutorialCompleted);
  const setTutorialStep = useSettingsStore((s) => s.setTutorialStep);
  const resetGame = useGameStore((s) => s.resetGame);
  const resetPortfolio = useTradingStore((s) => s.resetPortfolio);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">Settings</h1>
        </div>

        {/* Sound Section */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            Sound Effects
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Enable Sounds</div>
                <div className="text-[10px] text-muted-foreground">
                  Play audio feedback for trades, achievements, and interactions
                </div>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={toggleSound} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span>Volume</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input
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
        </div>

        {/* Tutorial Section */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            Tutorial
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">Replay Tutorial</div>
              <div className="text-[10px] text-muted-foreground">
                Walk through the guided tour again from the beginning
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
        </div>

        {/* Reset Section */}
        <div className="rounded-lg border border-destructive/20 bg-card p-4">
          <div className="mb-3 text-sm font-semibold text-destructive">
            Danger Zone
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Reset Game Progress</div>
                <div className="text-[10px] text-muted-foreground">
                  Reset XP, level, and all achievements to zero
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={resetGame}
              >
                Reset XP
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Reset Portfolio</div>
                <div className="text-[10px] text-muted-foreground">
                  Clear all positions, trades, and reset cash to $100,000
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={resetPortfolio}
              >
                Reset Portfolio
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
