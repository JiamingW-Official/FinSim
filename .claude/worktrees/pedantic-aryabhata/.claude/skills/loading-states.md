# Skill: loading-states
Add proper loading states to all async content. Rules:
- Use skeleton loading (not spinner) for content areas
- Skeleton: `animate-pulse bg-muted rounded-md` with appropriate dimensions
- Spinner only for actions (button loading, form submit)
- Loading skeleton should match the shape of final content
- No "Loading..." text — use visual skeletons only
- Charts: show axes with skeleton area
- Tables: show header with skeleton rows (3-5 rows)
Find missing loading states, add skeletons. Report additions.
