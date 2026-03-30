# Skill: secondary-color-sweep
Fix remaining color violations on ALL non-hero pages. Map:
- text-blue-* → text-primary or text-muted-foreground
- bg-blue-* → bg-primary/* or bg-muted
- text-purple-*/violet-* → text-primary or text-orange-*
- bg-purple-*/violet-* → bg-primary/* or bg-muted
- text-cyan-*/teal-* → text-muted-foreground or text-emerald-*
- border-blue-*/purple-*/violet-* → border-border or border-primary
SKIP: src/app/page.tsx, QuizStep.tsx, chart legend semantic colors
