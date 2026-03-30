# Fix Lesson TypeScript Types

Fix common TypeScript errors in FinSim lesson unit files.

**Usage:** `/fix-lesson-types <file-path>`

## Common Errors and Fixes

### Error: Property 'isTrue' does not exist
**Fix:** Replace `isTrue:` with `correct:` on all `quiz-tf` steps.

### Error: options must have exactly 4 elements
**Fix:** Ensure `options` array has exactly 4 strings: `["A", "B", "C", "D"]`

### Error: Type 'LessonUnit' is not assignable to type 'Unit'
**Fix:** Change the import from `{ LessonUnit }` to `{ Unit }` from `"./types"`, and update the type annotation.

### Error: Property 'xp' is missing
**Fix:** Add `xp: 75` (or 80/85/90) to each lesson object.

### Error: Cannot find module '@/types/lesson'
**Fix:** Change import to `import { Unit } from "./types"` (relative path, not @/ alias).

## Fix Process
1. Read the file with errors
2. Apply fixes for each error type found
3. Re-check: `grep -n "isTrue\|LessonUnit\|@/types/lesson" <file>` — should return nothing
4. Verify `correct: boolean` is used on quiz-tf steps
5. Verify `options: [string, string, string, string]` on quiz-mc steps
