# FinSim Agent Context

Full context for building FinSim dashboard pages and lessons.

**Usage:** `/finsim-agent` (inject this at the start of any FinSim build agent prompt)

## Project Setup
- **Worktree:** `/Users/jiamingw/Documents/GitHub/FinSim/.claude/worktrees/pedantic-aryabhata`
- **Branch:** `claude/pedantic-aryabhata`
- **Framework:** Next.js 16, TypeScript strict, Turbopack
- **Route group:** `src/app/(dashboard)/`
- **State:** Zustand v5 with persist

## Tech Stack
- **UI:** shadcn/ui components (Card, Badge, Button, Tabs, Slider, Progress, Dialog, Tooltip)
- **Animations:** Framer Motion (AnimatePresence, motion.div)
- **Styling:** Tailwind CSS dark theme
- **Charts:** Pure SVG only — NO recharts, chart.js, d3, or any external chart library

## PRNG Pattern (required for all pages)
```typescript
let s = SEED;
const rand = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
```
Reset with: `const resetSeed = () => { s = SEED; };`

## Page Structure Pattern
```tsx
"use client";
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
// Lucide icons as needed

// SEEDED PRNG
let s = SEED;
const rand = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };

// INTERFACES (no `any`)
interface MyData { ... }

// DATA GENERATION (runs at module level, deterministic)
const generateData = (): MyData[] => { ... };
const DATA = generateData();

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("tab1");

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Page Title</h1>
        <Badge>Subtitle</Badge>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          ...
        </TabsList>
        <TabsContent value="tab1" className="data-[state=inactive]:hidden">
          ...
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## Lesson Unit Pattern
```typescript
import { Unit } from "./types";

export const UNIT_MY_TOPIC: Unit = {
  id: "my-topic",
  title: "My Topic",
  description: "Brief description",
  icon: "LucideIconName",
  color: "#hex",
  lessons: [
    {
      id: "my-topic-1",
      title: "Lesson Title",
      xp: 75,
      steps: [
        { type: "teach", title: "...", content: "...", bullets: ["..."] },
        { type: "quiz-mc", question: "...", options: ["A","B","C","D"], correctIndex: 0, explanation: "..." },
        { type: "quiz-tf", statement: "...", correct: true, explanation: "..." },
      ]
    }
  ]
};
```

## Key Patterns
- Tab content: use `data-[state=inactive]:hidden` to prevent scroll issues
- Framer Motion: DON'T use `variants` with stagger on conditionally-rendered children
- SVG charts: always pure SVG, no external libraries
- All numbers from seeded PRNG for deterministic rendering
- TypeScript: no `any`, use proper interfaces for all data shapes
