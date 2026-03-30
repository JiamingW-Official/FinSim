# Build Lesson Unit

Build a new lesson unit TypeScript file for FinSim.

**Usage:** `/build-lesson <unit-id> <title> <icon> <color>`

## Instructions

Create `src/data/lessons/unit-<unit-id>.ts` in the worktree at `/Users/jiamingw/Documents/GitHub/FinSim/.claude/worktrees/pedantic-aryabhata`.

Parse arguments as: unit-id title icon color

### File Requirements

```typescript
import { Unit } from "./types";

export const UNIT_<UNIT_ID_UPPER>: Unit = {
  id: "<unit-id>",
  title: "<title>",
  description: "...",
  icon: "<icon>",  // Lucide icon name string
  color: "<color>", // hex color
  lessons: [
    // 4 lessons, each with 3-5 steps
  ]
};
```

### Step Types (from `./types`):
- `{ type: "teach"; title: string; content: string; bullets?: string[] }`
- `{ type: "quiz-mc"; question: string; options: [string, string, string, string]; correctIndex: number; explanation: string }`
- `{ type: "quiz-tf"; statement: string; correct: boolean; explanation: string }`

### Lesson Shape:
```typescript
{ id: string; title: string; xp: number; steps: Step[] }
```

### After Writing:
1. Read `src/data/lessons/index.ts` to see the current imports and UNITS array
2. Add the import line after the last import
3. Append the new unit to the UNITS array
4. Confirm zero TypeScript errors in the new file
