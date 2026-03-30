# Build Dashboard Page

Build a new Next.js dashboard page for FinSim.

**Usage:** `/build-page <route-name> <title> <description> <seed>`

## Instructions

Create `src/app/(dashboard)/$ARGUMENTS/page.tsx` in the worktree at `/Users/jiamingw/Documents/GitHub/FinSim/.claude/worktrees/pedantic-aryabhata`.

Parse the arguments as: route-name title description seed (space-separated, title and description may be quoted).

### Page Requirements
- `"use client"` directive at top
- Seeded PRNG: `let s = <seed>; const rand = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };`
- Imports: React hooks, Lucide icons, shadcn/ui (Card, CardContent, CardHeader, CardTitle, Badge, Button, Tabs, TabsContent, TabsList, TabsTrigger), framer-motion
- Dark theme Tailwind: bg-background, text-foreground, border-border
- NO external chart libraries — pure SVG for all visualizations
- 4 tabs covering distinct aspects of the topic
- Framer Motion entrance animations on main content
- Full TypeScript, no `any` types, proper interfaces
- Default export function named after the page

### File Template
```tsx
"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// ... more imports as needed

let s = SEED;
const rand = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };

// interfaces here

export default function PageNamePage() {
  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* header */}
      </motion.div>
      <Tabs defaultValue="tab1">
        <TabsList>...</TabsList>
        <TabsContent value="tab1">...</TabsContent>
        ...
      </Tabs>
    </div>
  );
}
```

After writing, confirm zero TypeScript errors.
