# Bulk Fix TypeScript Errors

Scan and fix all TypeScript errors across the FinSim worktree.

**Usage:** `/bulk-fix-ts`

## Instructions

In `/Users/jiamingw/Documents/GitHub/FinSim/.claude/worktrees/pedantic-aryabhata`:

### Step 1: Get All Errors
```bash
cd /Users/jiamingw/Documents/GitHub/FinSim/.claude/worktrees/pedantic-aryabhata
npx tsc --noEmit 2>&1 | grep "error TS" | head -100
```

### Step 2: Group by File
Parse the error output — group errors by filename. Focus on files with the most errors first.

### Step 3: Fix Priority Order
1. **Missing imports** (`Cannot find module`, `Module has no exported member`)
   - Fix: add correct import or remove unused import
2. **Type errors** (`Type 'X' is not assignable to type 'Y'`)
   - Fix: add explicit type annotation or fix the value
3. **`any` type** (if `noImplicitAny` is on)
   - Fix: replace `any` with proper interface
4. **Missing properties** (`Property 'X' is missing`)
   - Fix: add property to object or make it optional
5. **Unused variables** (`'X' is declared but never used`)
   - Fix: remove the declaration

### Step 4: Common FinSim-Specific Fixes

**Lesson files:**
```bash
# Find all files using wrong `isTrue` field:
grep -rl "isTrue:" src/data/lessons/
# Fix: replace isTrue with correct
sed -i '' 's/isTrue:/correct:/g' src/data/lessons/unit-*.ts
```

**Page files — unused import:**
```tsx
// Remove any import that's not used in JSX
// Common unused: AnimatePresence (if no conditional renders), Dialog, Tooltip
```

**SVG type errors:**
```tsx
// Fix: add explicit types to SVG event handlers
const handleMouseEnter = (e: React.MouseEvent<SVGElement>) => { ... }
```

### Step 5: Verify
```bash
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
```
Target: 0 errors. Report before/after counts.

### Step 6: Commit Fixes
```bash
git add -A
git commit -m "Fix TypeScript errors across wave pages and lesson files

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
