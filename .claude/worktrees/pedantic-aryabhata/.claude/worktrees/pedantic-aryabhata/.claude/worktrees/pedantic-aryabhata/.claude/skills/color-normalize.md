# Skill: color-normalize
Normalize colors across the app to a consistent, professional palette. Rules:
- Primary accent: orange-400/orange-500 ONLY (no blue, purple, or teal accents)
- Success: emerald-500 (not green-400 or lime)
- Danger: red-500 (not rose or pink)
- Warning: amber-500 (not yellow)
- Neutral text: foreground, muted-foreground ONLY
- Backgrounds: bg-background, bg-card, bg-muted ONLY
- Remove ALL gradient backgrounds (bg-gradient-to-*) except landing page hero
- Remove ALL glow effects (shadow-[0_0_*], box-shadow with color spread)
- Replace colored borders with border-border consistently
Find violations with grep, fix with Edit. Report count of fixes per file.
