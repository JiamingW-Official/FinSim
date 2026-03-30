# Add Route to Navigation

Add a new dashboard route to the FinSim sidebar navigation.

**Usage:** `/add-route <route-name> <display-name> <icon> <section>`

## Instructions

Read `src/components/layout/Sidebar.tsx` (or wherever navigation is defined) in the worktree at `/Users/jiamingw/Documents/GitHub/FinSim/.claude/worktrees/pedantic-aryabhata`.

Find the navigation array/config and add a new entry:
```typescript
{
  href: "/<route-name>",
  label: "<display-name>",
  icon: <Icon />,  // Lucide icon component
}
```

Add it to the appropriate section (e.g., "Trading", "Learn", "Analytics", "Tools").

If there's no appropriate section, add to the most relevant existing section or create a new one.

Common sections in FinSim sidebar:
- Markets / Trading
- Portfolio / Analysis
- Learn / Education
- Tools / Simulators
- Advanced / Pro

After editing, verify the file has no syntax errors by checking for balanced braces.
