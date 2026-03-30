# Launch Agent Wave

Launch a wave of 8 parallel background agents to build FinSim pages and lessons.

**Usage:** `/launch-wave <wave-number> <seed-base>`

Where seed-base = wave-number * 10 (e.g., wave 84 → seed base 840)

## Instructions

Launch exactly 8 background agents simultaneously for Wave <wave-number>. Each agent gets a unique seed (seed-base + 0 through seed-base + 7).

### Agent Distribution per Wave
- 6 agents: dashboard pages (`src/app/(dashboard)/<route>/page.tsx`)
- 2 agents: lesson units (`src/data/lessons/unit-<topic>.ts`)

### Page Agent Prompt Template
```
Create `src/app/(dashboard)/<route>/page.tsx` in the worktree at
`/Users/jiamingw/Documents/GitHub/FinSim/.claude/worktrees/pedantic-aryabhata`.

Topic: <topic description>
Seed: <seed>

Use seeded PRNG: let s = <seed>; const rand = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };

Requirements:
- "use client" directive
- shadcn/ui + framer-motion + Lucide icons
- Dark theme (bg-background, text-foreground, border-border)
- Pure SVG charts (NO external chart libs)
- 4 tabs covering distinct aspects
- Full TypeScript, no `any`
- Default export
```

### After All 8 Complete
Run `/commit-wave <wave-number> <summary>` to commit all files, then immediately run `/launch-wave <wave-number+1> <seed-base+10>`.

### Topics to Cover (pick fresh ones not yet created)
Finance domains: options, futures, bonds, FX, equity, credit, macro, quant, PE, VC, real estate, commodities, crypto, derivatives, risk management, portfolio theory, behavioral finance, ESG, fintech, central banking, insurance, pension, alternative investments, structured products.

Lesson topics: financial concepts that benefit from step-by-step teaching with quizzes.
