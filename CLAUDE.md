# Stack Internal – Design Prototype

SvelteKit 2 + Svelte 5 app prototyping the "Stack Internal" knowledge management product. UI-only — no backend, no database.

## Dev server

```bash
npm run dev   # http://localhost:5174
```

The prototype lives at `/` (root).

## Tech stack

- **SvelteKit 2 / Svelte 5** — use runes everywhere. No legacy reactive syntax.
- **Stacks CSS** — imported in `src/routes/+layout.svelte`. All atomic utility classes are available globally without imports.
- **`@stackoverflow/stacks-icons`** — import icons from this package. Do not use custom SVGs for icons that exist here.
- **`@stackoverflow/stacks-svelte`** — Svelte component wrappers for Stacks. Check here before writing custom components.

### Svelte 5 runes

| Use | Instead of |
|-----|-----------|
| `$state()` | `let x = ...` + `$: ...` |
| `$derived()` | `$: derived = ...` |
| `$effect()` | `onMount`, `afterUpdate` |
| `$props()` | `export let` |

### UI priority order

1. **Stacks Svelte components** — check before building anything custom
2. **Stacks atomic CSS** — all spacing, color, layout, typography
3. **Stacks icons** — no custom SVGs for icons that exist in the package
4. **Custom CSS** — only if Stacks genuinely can't do it

### Design guidelines

`Design.md` contains UX and design rules for Stacks — button styles, navigation patterns, form conventions, modal usage, notices, and accessibility requirements. Read it before making UI decisions.

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

## MCP servers — required usage

### Stacks MCP (always use for UI work)

Before implementing any UI component, layout, or style: call `mcp__stacks__get_stacks_documentation` to look up the relevant Stacks component, atomic class, or pattern. Do not guess at class names or build from scratch without checking.

### Playwright MCP (always verify UI changes)

After every visual change, use the Playwright MCP tools to:
1. Navigate to `http://localhost:5174/` (or the relevant route)
2. Take a screenshot to confirm the change looks correct
3. Interact with any affected interactive elements to verify behaviour
4. Report and fix any issues before considering the task done

Use `/verify-ui` to run the full verification workflow.

### Figma MCP (always use when a Figma URL is provided)

When a `figma.com` URL is shared, immediately use `mcp__figma__get_design_context` to fetch the design. Then:
1. Map each design element to the closest Stacks component or atomic class
2. Prefer Stacks components over custom code
3. Use Stacks color tokens, spacing, and typography — avoid raw hex values or custom CSS where Stacks covers it
4. Note any design decisions where no Stacks equivalent exists

Use `/figma-to-stacks` to run the full Figma implementation workflow.

## Component conventions

- New reusable components go in `src/lib/components/`
- Side panels use `SlidePanel.svelte` (open, title, bind:width, onclose, children)
- Dark mode is toggled via `.app-shell.dark` on the layout wrapper — add `:global(.app-shell.dark)` overrides for dark-aware components
- Sidebar state (collapsed/expanded) lives in `src/routes/+layout.svelte`

## Key files

| File | Purpose |
|------|---------|
| `src/routes/+page.svelte` | Main chat UI |
| `src/routes/demo/1/+page.svelte` | Scripted demo — "Who leads Project Yak?" |
| `src/routes/demo/2/+page.svelte` | Scripted demo — "Is there a prototype?" |
| `src/routes/+layout.svelte` | Shell, sidebar collapse, dark mode |
| `src/lib/components/Sidebar.svelte` | Left navigation |
| `src/lib/components/SlidePanel.svelte` | Reusable right-side panel |
| `src/lib/components/ChatTabs.svelte` | Shared tab bar with overflow menu |
| `src/lib/components/VerifiedBadge.svelte` | Verified badge (HTML/CSS) |
| `src/lib/stores/tabs.svelte.ts` | Shared tab state (tabs, activeTabId) across all chat pages |
| `src/lib/stores/chat.ts` | `newChatSignal` store |
| `Design.md` | UX and design rules for Stacks — read before making UI decisions |

## Stacks CSS quick reference

Spacing: `p8`, `px16`, `my4`, `g8` — Flexbox: `d-flex`, `ai-center`, `jc-between`, `fd-column` — Typography: `fs-body1`, `fw-bold`, `fc-black-600` — Colors: `fc-orange-500`, `bg-black-050`

Full reference: query Stacks MCP with `get_stacks_documentation`.
