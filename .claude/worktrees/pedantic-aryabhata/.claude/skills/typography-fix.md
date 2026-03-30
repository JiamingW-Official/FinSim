# Skill: typography-fix
Fix typography hierarchy for professional fintech feel. Rules:
- Page titles: text-lg font-semibold (NOT font-black, NOT text-2xl+)
- Section headers: text-sm font-semibold
- Body text: text-sm text-foreground
- Captions/labels: text-xs text-muted-foreground
- Stats/numbers: text-sm font-mono tabular-nums
- Remove ALL font-black usage (replace with font-bold or font-semibold)
- Remove ALL text-[9px] or text-[10px] (minimum text-[11px] or text-xs)
- Remove ALL uppercase tracking-wider labels (replace with sentence case)
- Emoji in headings: REMOVE unless it's learn/quiz content
Grep for violations, fix with Edit. Report changes.
