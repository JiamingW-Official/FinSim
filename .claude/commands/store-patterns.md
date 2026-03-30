# FinSim Store Patterns

Zustand store patterns for reading/writing game state in FinSim pages.

**Usage:** `/store-patterns` — reference when a page needs to interact with game state.

## Available Stores

### Game Store (`src/stores/game-store.ts`)
```typescript
import { useGameStore } from "@/stores/game-store";

// Read state
const { player, portfolio, tradeHistory, achievements } = useGameStore();

// Actions
const {
  addXP,           // addXP(amount: number)
  recordTrade,     // recordTrade(trade: Trade)
  unlockAchievement, // unlockAchievement(id: string)
  updateStat,      // updateStat(key: keyof PlayerStats, value: number)
  addBalance,      // addBalance(amount: number)
} = useGameStore();

// Player shape
interface Player {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  balance: number;
  stats: PlayerStats;
}
```

### Chart Store (`src/stores/chart-store.ts`)
```typescript
import { useChartStore } from "@/stores/chart-store";

const {
  currentTicker,
  currentTimeframe,
  activeIndicators,
  revealedCount,
  setTicker,
  setTimeframe,
  toggleIndicator,
  advanceBars,
} = useChartStore();

// IndicatorType = "sma" | "ema" | "rsi" | "macd" | "bb" | "volume" |
//                 "stoch" | "atr" | "adx" | "obv" | "cci" | "williams_r" | "psar"
```

### Quest Store (if exists)
```typescript
import { useQuestStore } from "@/stores/quest-store";
const { quests, completeQuest, activeQuests } = useQuestStore();
```

## XP Award Pattern
```tsx
// Award XP when user completes an action
const { addXP, unlockAchievement } = useGameStore();

const handleComplete = () => {
  addXP(50); // award 50 XP
  // Optionally unlock achievement
  unlockAchievement("first_analysis");
};
```

## Trade Recording Pattern
```tsx
import { useGameStore } from "@/stores/game-store";

const { recordTrade } = useGameStore();

const handleTrade = () => {
  recordTrade({
    id: Date.now().toString(),
    ticker: "AAPL",
    side: "long",        // "long" | "short"
    entryPrice: 150.0,
    exitPrice: 165.0,
    shares: 10,
    realizedPnL: 150,
    timestamp: Date.now(),
  });
};
```

## Achievement IDs (existing)
```typescript
// From src/types/game.ts
const ACHIEVEMENT_IDS = [
  "first_trade", "profitable_trader", "day_trader",
  "vol_analyst", "flow_watcher", "condor_master", "options_millionaire",
  "perfect_quiz", "lesson_complete", "streak_7",
];
```

## Pattern: Page That Awards XP on Visit
```tsx
"use client";
import { useEffect } from "react";
import { useGameStore } from "@/stores/game-store";

export default function MyPage() {
  const { addXP, updateStat } = useGameStore();

  useEffect(() => {
    // Award XP once per visit
    addXP(25);
    updateStat("pagesVisited", 1);
  }, []); // empty dep array = once on mount

  // ... rest of page
}
```
