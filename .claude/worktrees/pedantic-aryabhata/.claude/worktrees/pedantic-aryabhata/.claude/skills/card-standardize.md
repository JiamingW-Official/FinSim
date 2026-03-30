# Skill: card-standardize
Standardize all card components across the app. Every card should follow:
- Container: `rounded-lg border border-border bg-card`
- Header: `px-4 py-3 border-b border-border` with `text-sm font-semibold`
- Body: `p-4`
- No colored borders (remove border-orange-*, border-emerald-*, etc. on cards)
- No gradient backgrounds on cards
- No shadow-lg or shadow-xl (use shadow-sm at most)
- No ring effects on cards
- Consistent hover state: `hover:bg-accent/50` if interactive
Find non-standard cards, normalize. Report count.
