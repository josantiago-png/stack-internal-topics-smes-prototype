---
name: figma-to-stacks
description: Implement a Figma design using Stacks components and atomic CSS. Use when a figma.com URL is provided. Fetches the design, maps elements to Stacks, and implements in SvelteKit/Svelte 5.
---

Implement the Figma design: $ARGUMENTS

## Step 1 — Fetch the design

Use `mcp__figma__get_design_context` with the fileKey and nodeId extracted from the URL:
- `figma.com/design/:fileKey/:name?node-id=:nodeId` → convert `-` to `:` in nodeId
- This returns a screenshot, layout data, and any Code Connect mappings

Study the screenshot carefully before writing any code.

## Step 2 — Map to Stacks

For each element in the design, find the Stacks equivalent before writing code:

| Design element | Action |
|---------------|--------|
| Button | Query Stacks MCP: "button" — use `s-btn` classes or `@stackoverflow/stacks-svelte` Button |
| Text input | Query Stacks MCP: "input" — use `s-input` |
| Badge / tag | Query Stacks MCP: "badge" — use `s-badge` |
| Card / panel | Query Stacks MCP: "card" |
| Icon | Check `@stackoverflow/stacks-icons` exports for a matching icon |
| Color | Map to nearest Stacks color token (`fc-black-600`, `bg-orange-100`, etc.) |
| Spacing | Map px values to nearest Stacks spacing unit (multiples of 4) |
| Typography | Map to Stacks type scale (`fs-body1`, `fs-caption`, `fw-bold`, etc.) |

Call `mcp__stacks__get_stacks_documentation` for any element type you're unsure about.

## Step 3 — Implement

- New reusable pieces go in `src/lib/components/`
- Use Stacks atomic classes for all layout and styling
- Only write custom CSS for things Stacks cannot cover
- For dark mode, add `:global(.app-shell.dark)` overrides

## Step 4 — Verify in browser

After implementing, run the verify-ui skill:
- Navigate to the page with Playwright
- Take a screenshot and compare against the Figma design screenshot
- Check spacing, colors, typography, and interactions
- Fix any discrepancies

## Step 5 — Note gaps

If any part of the design cannot be matched with Stacks components:
- Document the gap clearly
- Use the closest Stacks equivalent and note the deviation
- Do not introduce new design tokens or one-off styles without flagging it
