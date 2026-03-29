# Skill: icon-standardize
Standardize icon usage across the app. Rules:
- Use lucide-react icons ONLY (no emoji as icons, no custom SVG icons)
- Icon sizes: h-4 w-4 (default), h-3.5 w-3.5 (small/inline), h-5 w-5 (section headers)
- Icon color: text-muted-foreground (default), text-primary (active/accent)
- No colored icon backgrounds (remove bg-orange-500/10, bg-emerald-500/10 icon wrappers)
- Replace emoji section markers with lucide icons
- Consistent icon + text gap: gap-2
Find emoji-as-icon usage and non-standard icon patterns, fix. Report changes.
