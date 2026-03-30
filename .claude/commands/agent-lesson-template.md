# Agent Lesson Template

Complete copy-paste agent prompt for building a FinSim lesson unit. Minimizes token usage.

**Usage:** `/agent-lesson-template` — copy this template, fill in CAPS placeholders.

---

## Template (copy everything below the line)
---

Create `src/data/lessons/unit-TOPIC.ts` in the git worktree at `/Users/jiamingw/Documents/GitHub/FinSim/.claude/worktrees/pedantic-aryabhata`.

### Exact Type (copy verbatim)
```typescript
import { Unit } from "./types";

export const UNIT_TOPIC_UPPER: Unit = {
  id: "topic-id",
  title: "Topic Title",
  description: "One sentence description",
  icon: "LUCIDE_ICON_NAME",  // string, not JSX
  color: "#HEX_COLOR",
  lessons: [
    {
      id: "topic-id-1",
      title: "Lesson 1 Title",
      xp: 75,
      steps: [
        { type: "teach", title: "...", content: "...", bullets: ["..."] },
        { type: "quiz-mc", question: "...", options: ["A","B","C","D"], correctIndex: 0, explanation: "..." },
        { type: "quiz-tf", statement: "...", correct: true, explanation: "..." },
      ],
    },
    // 3 more lessons
  ],
};
```

### Critical Rules
- `quiz-tf` uses `correct: boolean` — NOT `isTrue`
- `options` must be exactly 4 strings
- Import from `"./types"` (relative), NOT `"@/types/lesson"`
- `icon` is a string (Lucide name), NOT a JSX element
- Each lesson needs `xp` field (75/80/85/90)

### Content: 4 Lessons × 4-5 Steps Each
Lesson 1: LESSON1_TOPIC — LESSON1_DESCRIPTION
Lesson 2: LESSON2_TOPIC — LESSON2_DESCRIPTION
Lesson 3: LESSON3_TOPIC — LESSON3_DESCRIPTION
Lesson 4: LESSON4_TOPIC — LESSON4_DESCRIPTION

### After Writing: Update Index
1. Read `src/data/lessons/index.ts`
2. Add import after last import line
3. Append unit to UNITS array
4. Use the Edit tool (not Write) to avoid overwriting the file

Use Write tool for the new file, Edit tool for index.ts. Confirm zero TS errors.
