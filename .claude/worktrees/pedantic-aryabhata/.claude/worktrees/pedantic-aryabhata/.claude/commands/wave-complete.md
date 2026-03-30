# Wave Complete: Commit + Launch Next

Atomically commit a completed wave and launch the next one.

**Usage:** `/wave-complete <completed-wave-number> <next-wave-number>`

## Instructions

### Step 1: Commit Completed Wave

In `/Users/jiamingw/Documents/GitHub/FinSim/.claude/worktrees/pedantic-aryabhata`:

```bash
# Check what's pending
git status --short

# Stage all changed files (handle parens in path)
git add src/data/lessons/index.ts
git add src/data/lessons/unit-*.ts
# For each dashboard page directory:
git add 'src/app/(dashboard)/PAGENAME/'

# Commit
git commit -m "Wave N: [auto-summarize from files] pages; [lesson names] lessons

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

Auto-generate the commit summary by:
1. Listing new `src/app/(dashboard)/*/page.tsx` files → extract directory names
2. Listing new `src/data/lessons/unit-*.ts` files → extract unit names
3. Format: "Wave N: PageA, PageB, PageC pages; lesson-topic-1, lesson-topic-2 lessons"

### Step 2: Launch Next Wave Immediately

Calculate: next_seed_base = next_wave_number × 10

Launch 8 background agents for Wave <next-wave-number>:
- 6 page agents (seeds: base+0 through base+5)
- 2 lesson agents (seeds not needed for lessons)

### Topics to Avoid (already created — check git log)
Before assigning topics, run:
```bash
ls src/app/(dashboard)/ | sort
ls src/data/lessons/unit-*.ts | sort
```
Pick topics NOT in those lists.

### Wave N+1 Topic Suggestions
Pick from these finance domains (if not already done):
- Pages: prime brokerage, structured notes, convertible bonds, ABS pricing, CDO mechanics, loan syndication, project finance, trade finance simulator, export credit, sukuk/Islamic bonds, microfinance, green bonds, inflation-linked bonds, covered bonds, agency MBS, CMBS, leveraged buyout, growth equity, angel investing, crowdfunding, SPACs
- Lessons: reading earnings calls, DCF step-by-step, bond duration, options basics, position sizing, journaling trades, sector analysis, competitive moats, financial ratios, working capital, cash flow statement, income statement deep dive
