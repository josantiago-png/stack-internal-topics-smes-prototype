# AI Agent Instructions

This project uses **SvelteKit 2 + Svelte 5** and the **Stacks design system**. Follow these rules precisely.

---

## Svelte 5

Use runes everywhere. No legacy reactive syntax.

| Use | Instead of |
|-----|-----------|
| `$state()` | `let x = ...` + `$: ...` |
| `$derived()` | `$: derived = ...` |
| `$effect()` | `onMount`, `afterUpdate` |
| `$props()` | `export let` |

When unsure about Svelte 5 or SvelteKit syntax, query the Svelte MCP server (`list-sections`, then `get-documentation`).

---

## UI: Use Stacks

**Priority order — follow strictly:**

1. **Stacks Svelte components** (`@stackoverflow/stacks-svelte`) — check first before building anything custom
2. **Stacks atomic CSS** — use for all spacing, color, layout, and typography
3. **Stacks icons** (`@stackoverflow/stacks-icons`) — no custom SVGs for icons that exist here
4. **Custom CSS** — only if Stacks genuinely can't do it

Stacks CSS is imported in `src/routes/+layout.svelte`. No imports needed for atomic classes.

**Before implementing any UI**, call `mcp__stacks__get_stacks_documentation` to look up the relevant component, class, or pattern. Do not guess at class names.

**Read `Design.md`** before making any UI decisions. It documents the canonical rules for button styles, navigation, forms, modals, notices, and accessibility that apply to this project.

**Common atomic classes:**
- Spacing: `p8`, `px16`, `my4`, `g8`
- Flexbox: `d-flex`, `ai-center`, `jc-between`, `fd-column`
- Typography: `fs-body1`, `fw-bold`, `fc-black-600`
- Colors: `fc-orange-500`, `bg-black-050`

```svelte
<!-- Good -->
<div class="d-flex fd-column p16 g8">
  <Icon src={IconSearch} />
  <TextInput placeholder="Search..." />
  <Button variant="primary">Submit</Button>
</div>

<!-- Bad -->
<div style="display: flex; padding: 16px;">
  <input class="my-custom-input" />
  <button class="my-custom-button">Submit</button>
</div>
```

---

## Browser Testing

After every visual change, verify in the browser before considering the task done.

Use Playwright MCP — navigate to `http://localhost:5174`, take screenshots, and interact with affected elements.

Checklist:
- [ ] Dev server running (`npm run dev`)
- [ ] Screenshot at desktop (1280px+)
- [ ] Screenshot at mobile (375px)
- [ ] All interactive elements work (clicks, forms, modals)
- [ ] No console errors
- [ ] Fix any issues, re-verify
