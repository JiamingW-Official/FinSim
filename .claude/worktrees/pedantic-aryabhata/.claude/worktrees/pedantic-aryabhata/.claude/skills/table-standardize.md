# Skill: table-standardize
Standardize all data tables across the app. Rules:
- Use consistent header styling: `text-[11px] font-medium text-muted-foreground uppercase tracking-wide`
- Cell padding: `px-3 py-2`
- Row borders: `border-b border-border/50`
- Hover row: `hover:bg-muted/50`
- Numeric columns: `text-right font-mono tabular-nums`
- Positive values: `text-emerald-500`
- Negative values: `text-red-500`
- Sticky headers where scrollable
- No colored row backgrounds (remove bg-emerald-*/bg-red-* on rows)
Find all tables, normalize styling. Report changes.
