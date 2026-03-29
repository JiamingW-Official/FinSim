# Skill: button-standardize
Standardize all buttons. Rules:
- Primary: Use shadcn Button component with `variant="default"` (no custom bg-orange-500 or bg-emerald-500 buttons)
- Secondary: `variant="outline"` or `variant="ghost"`
- Destructive: `variant="destructive"`
- Remove ALL custom button styling (inline bg-*, text-*, rounded-xl on buttons)
- Button sizes: default or `size="sm"` only
- Remove ALL shadow-[0_0_*] glow effects on buttons
- Remove ALL gradient buttons (bg-gradient-to-*)
- Tab triggers should use consistent styling (not custom border-b-2 hacks)
Find violations, fix. Report changes.
