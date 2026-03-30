# Build Full Wave

Build a complete wave of 8 FinSim files using parallel background agents.

**Usage:** `/build-wave <wave-number>`

## Instructions

Calculate seed base = wave-number × 10.

Launch 8 background agents simultaneously (run_in_background: true) using the Agent tool.

### Standard Wave Composition
- Agents A-F (6 agents): Dashboard pages
- Agents G-H (2 agents): Lesson units

### Each Page Agent Prompt
```
Create `src/app/(dashboard)/<route>/page.tsx` in the git worktree at
`/Users/jiamingw/Documents/GitHub/FinSim/.claude/worktrees/pedantic-aryabhata`.

Topic: <TOPIC>
Use seed <SEED> with PRNG: let s = <SEED>; const rand = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };

Requirements:
- "use client" directive
- shadcn/ui + framer-motion + Lucide icons
- Dark theme (bg-background, text-foreground, border-border)
- NO external chart libs — pure SVG only
- 4 tabs with distinct financial content
- Full TypeScript strict, no `any`, proper interfaces
- Default export: `export default function <Name>Page()`

Use the Write tool to create the file.
```

### Each Lesson Agent Prompt
```
Create `src/data/lessons/unit-<topic>.ts` in the git worktree at
`/Users/jiamingw/Documents/GitHub/FinSim/.claude/worktrees/pedantic-aryabhata`.

Topic: <TOPIC>
Export: UNIT_<TOPIC_UPPER> as a Unit (from "./types")

4 lessons × 5 steps each (mix of teach/quiz-mc/quiz-tf steps).
Use `correct: boolean` on quiz-tf (not `isTrue`).
options on quiz-mc must be a 4-element string array.

After writing, read src/data/lessons/index.ts, add the import, and append to UNITS array.
```

### After All 8 Complete
1. Run `git add` on all pending files
2. Commit: `git commit -m "Wave <N>: <summary>\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"`
3. Immediately launch `/build-wave <N+1>`

### Topic Ideas by Domain
**Pages:** equity research, bond pricing, FX hedging, commodity trading, crypto analytics, risk dashboard, portfolio optimizer, pension modeling, insurance pricing, fintech payments, robo-advisor, dark pool simulation, prime brokerage, central bank tools, sovereign debt, carbon credits, real estate finance, startup valuation, SPACs, CLOs, ABS, covered bonds, Islamic finance, microfinance, development finance, financial inclusion

**Lessons:** reading financial statements, DCF valuation, technical analysis basics, bond math, options pricing, portfolio theory, behavioral finance biases, tax efficiency, retirement planning, insurance basics, estate planning, financial independence, debt management, inflation protection, currency hedging, commodity exposure, alternative investments intro, ESG investing, impact measurement
