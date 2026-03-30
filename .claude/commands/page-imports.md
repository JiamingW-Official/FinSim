# FinSim Page Import Reference

Standard imports for all FinSim dashboard pages. Copy-paste ready.

**Usage:** `/page-imports` (inject at top of any page-building task)

## Full Import Block

```tsx
"use client";
import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Lucide icons (pick what you need)
import {
  TrendingUp, TrendingDown, BarChart2, LineChart, PieChart,
  ArrowUp, ArrowDown, ArrowRight, RefreshCw, Settings,
  AlertTriangle, CheckCircle, XCircle, Info, Star,
  DollarSign, Percent, Activity, Target, Zap,
  ChevronDown, ChevronUp, ChevronRight, ChevronLeft,
  Play, Pause, RotateCcw, Download, Upload,
  Building2, Globe, Cpu, Shield, Lock,
} from "lucide-react";
```

## Minimal Import Block (most pages only need this)

```tsx
"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, TrendingDown, BarChart2, AlertTriangle, CheckCircle } from "lucide-react";
```

## PRNG Block (always include)

```tsx
let s = SEED;
const rand = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
const resetSeed = () => { s = SEED; };
// Helper: random int in [min, max]
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
// Helper: random float in [min, max]
const randFloat = (min: number, max: number) => min + rand() * (max - min);
// Helper: pick random item from array
const randItem = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
```

## Page Wrapper Pattern

```tsx
export default function MyPage() {
  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <TrendingUp className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Page Title</h1>
            <p className="text-sm text-muted-foreground">Subtitle description</p>
          </div>
        </div>
        <Badge variant="outline">Live</Badge>
      </motion.div>

      {/* Stats chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Metric 1", value: "123", change: "+4.2%" },
          { label: "Metric 2", value: "$1.2M", change: "-1.1%" },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-xl font-bold">{m.value}</p>
              <p className={m.change.startsWith("+") ? "text-green-500 text-xs" : "text-red-500 text-xs"}>
                {m.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tab1">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          <TabsTrigger value="tab4">Tab 4</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="data-[state=inactive]:hidden mt-4 space-y-4">
          {/* content */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## Color Palette (Tailwind classes)

| Purpose | Class |
|---------|-------|
| Positive/profit | `text-green-500`, `bg-green-500/10` |
| Negative/loss | `text-red-500`, `bg-red-500/10` |
| Warning | `text-amber-500`, `bg-amber-500/10` |
| Primary accent | `text-primary`, `bg-primary/10` |
| Muted text | `text-muted-foreground` |
| Card border | `border-border` |
| Background | `bg-card`, `bg-background` |
