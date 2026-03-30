# Skill: build-verify
Run full build verification after design changes. Steps:
1. Run `npx tsc --noEmit` — fix any TypeScript errors
2. Run `npx next build` — fix any build/SSR errors
3. Count total routes generated
4. Report: errors fixed, routes count, build time
This skill is run after every wave of changes to ensure nothing is broken.
