# Wave Status Check

Check the current build progress of the FinSim wave system.

**Usage:** `/wave-status`

## Instructions

In the worktree at `/Users/jiamingw/Documents/GitHub/FinSim/.claude/worktrees/pedantic-aryabhata`:

1. Run `git log --oneline | head -20` to see recent wave commits
2. Run `git status --short` to see pending uncommitted files
3. Count total dashboard pages: `ls src/app/\(dashboard\)/ | wc -l`
4. Count total lesson units: `ls src/data/lessons/unit-*.ts | wc -l`
5. Count total commits on this branch: `git log --oneline | wc -l`

Report:
- Current wave number (from latest commit message)
- Total pages created
- Total lesson units created
- Pending uncommitted files (if any)
- Estimated progress toward Wave 100
