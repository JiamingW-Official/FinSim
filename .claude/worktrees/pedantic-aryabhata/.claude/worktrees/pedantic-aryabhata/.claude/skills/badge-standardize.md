# Skill: badge-standardize
Standardize all badges/chips/pills across the app. Rules:
- Use shadcn Badge component with variants: default, secondary, outline, destructive
- Remove ALL custom pill styling (rounded-full px-2 py-0.5 with custom bg-*)
- Status badges: green=active/success, red=danger/loss, amber=warning/pending, gray=inactive
- Size: text-[11px] consistently
- No gradient badges
- No glow/shadow on badges
- No emoji in badges (use icons from lucide-react instead)
Find all custom badges, replace with standardized Badge. Report changes.
