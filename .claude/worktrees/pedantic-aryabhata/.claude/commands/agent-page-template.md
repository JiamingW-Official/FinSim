# Agent Page Template

Complete copy-paste agent prompt for building a FinSim dashboard page. Minimizes token usage by including all context inline.

**Usage:** `/agent-page-template` — copy this template and fill in CAPS placeholders.

---

## Template (copy everything below the line)
---

Create `src/app/(dashboard)/ROUTE/page.tsx` in the git worktree at `/Users/jiamingw/Documents/GitHub/FinSim/.claude/worktrees/pedantic-aryabhata`.

**Topic:** TOPIC_DESCRIPTION
**Seed:** SEED

### PRNG (required)
```typescript
let s = SEED;
const rand = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
```

### Requirements
- `"use client"` at top
- Imports: React hooks, Lucide icons, shadcn/ui (Card, CardContent, CardHeader, CardTitle, Badge, Button, Tabs, TabsContent, TabsList, TabsTrigger, Progress, Slider), framer-motion
- Tailwind dark theme: `bg-background`, `text-foreground`, `border-border`
- **NO external chart libraries** — all visualizations must be pure SVG
- 4 tabs with distinct substantive content per tab
- Each tab: at least 1 SVG visualization + data table/metrics
- Full TypeScript strict mode, no `any`, define proper interfaces
- Default export: `export default function PAGENAMEPage()`

### Tab Content
1. **TAB1_TITLE** — TAB1_DESCRIPTION
2. **TAB2_TITLE** — TAB2_DESCRIPTION
3. **TAB3_TITLE** — TAB3_DESCRIPTION
4. **TAB4_TITLE** — TAB4_DESCRIPTION

### SVG Pattern (use for all charts)
```tsx
// Line chart
const W=400,H=160,PAD=30;
const py=(v:number,min:number,max:number)=>H-PAD-((v-min)/(max-min||1))*(H-PAD*2);
const px=(i:number,n:number)=>PAD+(i/(n-1))*(W-PAD*2);
```

Use the Write tool to create the file. Confirm zero TypeScript errors.
