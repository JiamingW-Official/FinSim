# Check TypeScript Build

Run TypeScript type check on the FinSim worktree.

**Usage:** `/check-ts`

## Instructions

In the worktree at `/Users/jiamingw/Documents/GitHub/FinSim/.claude/worktrees/pedantic-aryabhata`:

```bash
cd /Users/jiamingw/Documents/GitHub/FinSim/.claude/worktrees/pedantic-aryabhata
npx tsc --noEmit 2>&1 | head -50
```

If errors exist, fix them:
1. Read the erroring file
2. Fix the TypeScript error (common issues: missing types, `any`, wrong prop names, missing imports)
3. Re-run `npx tsc --noEmit` to verify clean

Common fixes:
- Missing interface property → add to interface
- `any` type → replace with proper type
- Unused import → remove it
- Missing `"use client"` → add at top of file
- shadcn/ui prop error → check component accepts that prop

Report: total error count before and after fixes.
