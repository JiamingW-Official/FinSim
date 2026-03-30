# FinSim Lesson Types Reference

Exact TypeScript types for all lesson unit files. Use this to avoid looking up the types every time.

**Usage:** `/lesson-types` (inject into any lesson-building agent)

## Canonical Types (from `src/data/lessons/types.ts`)

```typescript
// Import ALWAYS from "./types" (relative, not @/ alias)
import { Unit } from "./types";

// Step union type:
type Step =
  | { type: "teach"; title: string; content: string; bullets?: string[] }
  | { type: "quiz-mc"; question: string; options: [string, string, string, string]; correctIndex: number; explanation: string }
  | { type: "quiz-tf"; statement: string; correct: boolean; explanation: string };
  // NOTE: quiz-tf uses `correct: boolean` NOT `isTrue: boolean`

// Lesson shape:
interface Lesson {
  id: string;          // e.g. "topic-1", "topic-2"
  title: string;
  xp: number;          // typically 75, 80, 85, or 90
  steps: Step[];       // 3-5 steps recommended
}

// Unit (= LessonUnit) shape:
interface Unit {
  id: string;
  title: string;
  description: string;
  icon: string;        // Lucide icon name as STRING (e.g. "TrendingUp", "BookOpen")
  color: string;       // hex color (e.g. "#6366F1")
  lessons: Lesson[];   // 4 lessons recommended
}
```

## File Template

```typescript
import { Unit } from "./types";

export const UNIT_MY_TOPIC: Unit = {
  id: "my-topic",
  title: "My Topic Title",
  description: "One sentence describing what learners will master",
  icon: "BookOpen",
  color: "#6366F1",
  lessons: [
    {
      id: "my-topic-1",
      title: "First Lesson",
      xp: 75,
      steps: [
        {
          type: "teach",
          title: "Key Concept",
          content: "Explanation of the concept in 2-3 sentences.",
          bullets: [
            "First key point",
            "Second key point",
            "Third key point",
          ],
        },
        {
          type: "quiz-mc",
          question: "What is the primary purpose of X?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctIndex: 1,
          explanation: "Option B is correct because...",
        },
        {
          type: "quiz-tf",
          statement: "Statement that is either true or false.",
          correct: true,
          explanation: "This is true because...",
        },
      ],
    },
  ],
};
```

## Index.ts Update Pattern

After creating the unit file, update `src/data/lessons/index.ts`:

```typescript
// Add import at end of imports section:
import { UNIT_MY_TOPIC } from "./unit-my-topic";

// Add to UNITS array:
export const UNITS: Unit[] = [
  // ... existing units ...
  UNIT_MY_TOPIC,  // ← append here
];
```

## Common Mistakes to Avoid
- ❌ `isTrue: boolean` → ✅ `correct: boolean`
- ❌ `options: string[]` with 3 items → ✅ exactly 4 items
- ❌ `import { LessonUnit } from "@/types/lesson"` → ✅ `import { Unit } from "./types"`
- ❌ Missing `xp` field on lesson → ✅ always include `xp: 75`
- ❌ Icon as JSX `<BookOpen />` → ✅ Icon as string `"BookOpen"`
