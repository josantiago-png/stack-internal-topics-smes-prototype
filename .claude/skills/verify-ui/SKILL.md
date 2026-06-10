---
name: verify-ui
description: Verify a UI change looks correct in the browser using Playwright. Run after any visual change to the prototype. Captures screenshots, checks layout and interactions, and reports issues.
---

Verify the UI change in the browser. Route to check: $ARGUMENTS (default: /)

## Steps

1. **Ensure dev server is running**
   - If not running, start it: `npm run dev`
   - Wait for it to be ready at `http://localhost:5174`

2. **Navigate to the page**
   - Use `mcp__playwright__browser_navigate` to go to `http://localhost:5174$ARGUMENTS`
   - If $ARGUMENTS is empty, navigate to `http://localhost:5174/`

3. **Take a desktop screenshot**
   - Use `mcp__playwright__browser_take_screenshot`
   - Review the screenshot carefully against what was intended

4. **Check at a narrow viewport**
   - Resize to 768px width with `mcp__playwright__browser_resize`
   - Take another screenshot and check layout doesn't break

5. **Interact with changed elements**
   - Click any new buttons, links, or interactive components
   - Hover over hover-state elements
   - Toggle any open/close behaviours (panels, dropdowns, modals)
   - Take screenshots of interactive states

6. **Check dark mode** (if the change affects styles)
   - Click the dark mode toggle in the sidebar user row
   - Take a screenshot to verify dark mode styles are correct

7. **Check browser console**
   - Use `mcp__playwright__browser_console_messages` to check for errors or warnings

8. **Report findings**
   - List what was verified
   - Flag any visual issues, broken interactions, or console errors
   - Fix any issues found and re-verify
