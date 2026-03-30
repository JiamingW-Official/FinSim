# FinSim Quick Stats

Get a fast summary of FinSim build progress with one command.

**Usage:** `/quick-stats`

## Instructions

Run these commands in `/Users/jiamingw/Documents/GitHub/FinSim/.claude/worktrees/pedantic-aryabhata`:

```bash
echo "=== PAGES ===" && ls src/app/\(dashboard\)/ | grep -v "^layout\|^page\|^\." | wc -l
echo "=== LESSONS ===" && ls src/data/lessons/unit-*.ts 2>/dev/null | wc -l
echo "=== COMMITS ===" && git log --oneline | wc -l
echo "=== LATEST 3 COMMITS ===" && git log --oneline -3
echo "=== PENDING FILES ===" && git status --short | wc -l
echo "=== BRANCH ===" && git branch --show-current
```

Report format:
```
📊 FinSim Build Stats
━━━━━━━━━━━━━━━━━━━━
📄 Dashboard Pages: XX
📚 Lesson Units:    XX
💾 Git Commits:     XXX
🌿 Branch: claude/pedantic-aryabhata

Latest: Wave XX committed (hash)
Pending: X files uncommitted

Progress: Wave XX/100 (XX%)
```

## Wave Estimation
- Each wave adds ~6 pages + 2 lessons
- Current wave ≈ (total_commits - base_commits) / 1.1
- Or read from latest commit message
