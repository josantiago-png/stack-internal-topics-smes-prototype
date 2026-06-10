---
name: stacks-ui
description: Background knowledge for building UI in this prototype. Apply automatically whenever writing components, styling elements, or choosing icons. Ensures Stacks design system is used correctly and consistently.
user-invocable: false
---

When building any UI in this project, follow this priority order strictly:

## 1. Query Stacks MCP first

Before writing any component or applying any style, call `mcp__stacks__get_stacks_documentation` with the relevant topic. Examples:
- Building a button → query "button"
- Adding a form input → query "input" or "text input"
- Creating a modal or dialog → query "modal"
- Laying out content → query "flexbox" or "grid"
- Choosing a color → query "color" or the specific semantic name

Never guess at Stacks class names — always confirm via MCP.

## 2. Component hierarchy

1. **`@stackoverflow/stacks-svelte`** — use the Svelte component if one exists
2. **Stacks atomic CSS classes** — for layout, spacing, typography, color
3. **`@stackoverflow/stacks-icons`** — for all icons
4. **Custom CSS/components** — only when Stacks has no equivalent; document why

## 3. Atomic class patterns

- Spacing: `p{n}`, `px{n}`, `py{n}`, `m{n}`, `mx{n}`, `my{n}`, `g{n}` (n = 2,4,6,8,12,16,24,32,48)
- Flexbox: `d-flex`, `fd-column`, `fd-row`, `ai-center`, `ai-start`, `jc-center`, `jc-between`, `jc-end`, `fl-grow1`, `fl-shrink0`
- Typography: `fs-body1`, `fs-body2`, `fs-caption`, `fs-title`, `fw-normal`, `fw-bold`, `fc-black-{n}`, `fc-orange-{n}`
- Colors: `bg-black-{n}`, `bc-black-{n}`, `fc-black-{n}` where n = 025, 050, 075, 100, 200, 300, 400, 500, 600, 700, 800, 900
- Brand: `fc-orange-500`, `bg-orange-{n}`
- States: `s-btn`, `s-btn__primary`, `s-btn__danger`, `s-input`, `s-badge`

## 4. Icons

Import from `@stackoverflow/stacks-icons/icons` or `@stackoverflow/stacks-icons/spots`. Query MCP or check the package exports for available names. Do not use custom SVG for an icon that exists in the package.

## 5. Dark mode

This prototype supports dark mode via `.app-shell.dark` on the shell wrapper. For any component that needs dark mode support, add scoped overrides:

```css
:global(.app-shell.dark) .my-component {
  background: #1b1b1b;
  color: #e3e3e3;
}
```

## 6. Avoid

- Raw hex values for colors that have Stacks tokens
- Custom CSS for spacing/layout that Stacks atomic classes cover
- Inline `style` attributes except for dynamic values (e.g., CSS custom properties)
- Font size/weight declarations that duplicate Stacks typography classes
