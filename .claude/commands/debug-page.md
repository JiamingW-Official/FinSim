# Debug FinSim Page

Diagnose and fix a broken FinSim dashboard page.

**Usage:** `/debug-page <route-name>`

## Instructions

### Step 1: Read the File
```bash
# In worktree:
cat src/app/(dashboard)/ROUTE/page.tsx | head -100
```

### Step 2: Check TypeScript Errors
```bash
npx tsc --noEmit 2>&1 | grep "ROUTE"
```

### Step 3: Common Issues & Fixes

#### Blank/white page
- **Cause:** Missing `"use client"` or unhandled runtime error
- **Fix:** Ensure `"use client"` is the very first line; wrap data generation in try/catch

#### Hydration mismatch
- **Cause:** Random values generated on server differ from client
- **Fix:** Move all PRNG calls inside `useMemo` or `useEffect`, or use `useState` with null initial

#### SVG not rendering
- **Cause:** Division by zero in scale calculations (when min === max)
- **Fix:** Add `|| 1` guard: `(max - min || 1)` in all scale functions

#### Infinite loop / freeze
- **Cause:** `useEffect` with missing or incorrect deps, or PRNG in render body modifying module-level `s`
- **Fix:** Reset seed before data generation; extract data gen outside component

#### Framer Motion opacity 0 stuck
- **Cause:** Using `variants` with stagger on conditionally rendered children
- **Fix:** Remove `variants`; use direct `initial`/`animate` props instead

#### shadcn Slider issues
- **Cause:** `value` must be array; `onValueChange` receives array
- **Fix:**
  ```tsx
  const [val, setVal] = useState([50]); // array!
  <Slider value={val} onValueChange={setVal} min={0} max={100} step={1} />
  // Use: val[0] to get the number
  ```

#### Tab content not showing
- **Cause:** Missing `data-[state=inactive]:hidden` or wrong `value` prop
- **Fix:**
  ```tsx
  <TabsContent value="tab1" className="data-[state=inactive]:hidden mt-4">
  ```

### Step 4: Verify Fix
After editing, run:
```bash
npx tsc --noEmit 2>&1 | grep "ROUTE"
```
Should return no output (zero errors).

### Step 5: Test Navigation
Check the route appears in the app at `/ROUTE-NAME`.
