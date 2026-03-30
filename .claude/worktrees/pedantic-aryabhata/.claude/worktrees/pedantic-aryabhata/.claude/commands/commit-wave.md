# Commit Wave Files

Commit all pending (untracked/modified) FinSim wave files to git.

**Usage:** `/commit-wave <wave-number> <description>`

## Instructions

In the worktree at `/Users/jiamingw/Documents/GitHub/FinSim/.claude/worktrees/pedantic-aryabhata`:

1. Run `git status --short` to see all pending files
2. Run `git add` on ALL untracked (`??`) and modified (`M`) files shown
3. Commit with message: `Wave <wave-number>: <description>\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
4. Run `git status` again to confirm clean working tree
5. Report the commit hash and files committed

## Git Add Pattern
```bash
# For dashboard pages (handle parentheses in path):
git add 'src/app/(dashboard)/pagename/'

# For lesson files:
git add src/data/lessons/unit-*.ts src/data/lessons/index.ts
```

## Commit Format
```bash
git commit -m "$(cat <<'EOF'
Wave NN: brief description of pages and lessons added

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```
