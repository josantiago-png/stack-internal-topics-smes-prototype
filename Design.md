# Stacks Design Guidelines

This document captures UX and design rules for building with the Stacks design system. It is intended for both human designers and AI agents implementing UI with Stacks components.

---

## Buttons

Stacks provides four button styles. Choosing the right one is critical to communicating visual hierarchy.

### Button styles

| Style | Class | When to use |
|---|---|---|
| **Base** (primary) | `.s-btn` | Primary actions throughout the product |
| **Danger** | `.s-btn.s-btn__danger` | Destructive actions (deleting content, accounts, canceling services) |
| **Featured** | `.s-btn.s-btn__featured` | New features or onboarding announcements only |
| **Tonal** | `.s-btn.s-btn__tonal` | Least important items or currently inactive actions |
| **Clear** | `.s-btn.s-btn__clear` | Secondary/tertiary actions alongside a primary button |

### Do

- **Use only one primary (base) button per view or form.** The unstyled `.s-btn` is the primary button — it draws the most attention.
- Use danger buttons to visually communicate destructive actions before the user commits.
- Use tonal buttons in layouts for the least important items or currently inactive actions.
- Pair a primary button with a clear variant for cancel/secondary actions.

### Don't

- Don't use featured buttons for permanent UI placements — they are for temporary, attention-grabbing moments only.
- Don't use icons within the extra small button size (`.s-btn__xs`) — standard icons are too large and break the button's height and layout.
- Don't use multiple primary-weight buttons in the same view; this undermines hierarchy.

### Button ordering

Order buttons by importance relative to their alignment.

- **Left-aligned:** most important → least important, left to right.
- **Right-aligned:** most important → least important, right to left (most important is on the far right).
- **In a column:** most important → least important, top to bottom.

### Toggle buttons

When a button can switch between selected and unselected states, add `.is-selected` and always annotate with `aria-pressed` for accessibility. A `title` attribute describing what will happen when pressed is also appropriate.

```html
<button class="s-btn" type="button" aria-pressed="false" title="Mark as favorite">…</button>
<button class="s-btn is-selected" type="button" aria-pressed="true" title="Remove from favorites">…</button>
```

---

## Navigation

### Do

- Include **at most one primary and one secondary navigation per page**.
- Use the **default size** (`.s-navigation`) for primary page-level navigation, typically near the top of the page.
- Use the **icon variant** for a prominent secondary horizontal navigation that directs users to main page sections. Limit to one per page.
- Use the **small variant** (`.s-navigation__sm`) for on-page filtering in space-constrained areas.
- Change icon styles with state: selected items use fill icons (e.g., `IconHomeFill` instead of `IconHome`).
- Use horizontal wrapping on larger screens; use `.s-navigation__scroll` (scrolling) on mobile.

### Don't

- Don't use multiple navigations with the same visual style on one page — it causes user confusion about which navigation controls what.
- Don't use the icon navigation variant for in-page filtering; use the small variant instead.
- Don't use icons with the small navigation variant.

---

## Forms

### Labels

- Write labels in **sentence case**.
- Always connect a label to its input using `for="[input-id]"` — this makes clicking the label focus the input.
- Place description copy (`.s-description`) directly beneath the label when the field needs further explanation.
- Use status badges on labels to append essential context (Required, Optional, New feature, etc.).
  - When **most** fields in a form are required: use the asterisk pattern with `.s-required-symbol`.
  - When only **some** fields are required: use a "Required" badge (`<span class="s-badge s-badge__danger">Required</span>`) on those labels.
  - Required symbols are **not** necessary for single-input areas (e.g., sign-up modals).

### Inputs

- Always add an `id` attribute to every input.
- Placeholder text should be used as a content prompt only when genuinely needed — not as a substitute for a label.
- Use `fieldset` and `legend` to group related inputs.

### Validation states

Stacks provides three validation states: `has-warning`, `has-error`, `has-success`. Apply to the wrapping parent container.

#### Do

- Show validation states **after form submission** in most cases.
- Clear the error state as soon as the user interacts with the field (e.g., focuses the input to re-enter a password).
- Associate validation messages with their input using `aria-describedby`.
- Add `aria-invalid="true"` on inputs in error state.
- Pair error/warning states with an icon — never rely on color alone.

#### Don't

- Don't show validation states before the user has submitted the form, except after a sufficient delay (e.g., username availability checks after the user stops typing).

### Select menus

- Use a `<select>` (`.s-select`) when there are **more than four** possible options.

### Toggle switches

- Prefer a toggle switch over an "on/off" radio button group — it takes up less space and communicates its purpose more clearly than a checkbox.
- Always pair a toggle switch with a label.

---

## Modals

> **Modals are purposefully disruptive and should be used thoughtfully and sparingly.**

### Do

- Use modals only when you need to interrupt the user to collect critical input or confirm a destructive action.
- For destructive actions, add `.s-modal__danger` to `.s-modal` and switch the primary action button to `.s-btn__danger`.
- Always include a close button with `aria-label="Close"`.
- Set `data-s-modal-return-element` so focus returns to the correct element when the modal closes.

### Don't

- Don't use modals as a general-purpose container for content that could live inline on the page.
- Don't stack modals on top of each other.

---

## Notices and Banners

### Notices (`.s-notice`)

Notices deliver system and engagement messaging.

| Variant | When to use |
|---|---|
| Default / Info / Success / Warning / Danger / Featured / Activity | Standard messaging at varying severity levels |
| **Important** (`.s-notice__important`) | Time-sensitive, pressing information that must be noticed — use sparingly |

- Use `role="alert"` for important or time-sensitive notices.
- Use `role="status"` for informational, non-urgent notices.

#### Toasts are deprecated

> Toasts (`.s-toast`) are being phased out due to significant accessibility barriers. **Avoid them for new features.** Instead, use integrated alternatives — component state changes or inline messages — to provide accessible feedback directly where the user is focused.

### Banners (`.s-banner`)

Banners are full-width and **highly intrusive**. Use only when essential information must be conveyed to all users.

| Placement | When to use |
|---|---|
| Pinned to top of browser (`.is-pinned`) | Site-wide notices (e.g., the site is in read-only mode) |
| Below top navigation (default) | Area-specific notices (e.g., a subscription is about to expire) |

---

## Accessibility

All Stack Overflow product UIs must conform to **WCAG 2.2 AA** at minimum.

### Color and contrast

- Use the APCA (Accessible Perceptual Contrast Algorithm) conformance levels:
  - All text: Lc 60
  - Body copy: Lc 75
  - Icons: Lc 45
  - Placeholder and disabled text: Lc 30
- **Never use color as the sole means of conveying information.** Always pair color with a non-color indicator (icon, pattern, or text label) to support users with color vision deficiency.

### Focus states

- All interactive elements must have a visible focus indicator.
- Stacks uses a double-outline focus ring (2px thick) on the inside of components.
- The outer ring uses `secondary-theme-400`; the inner ring uses white.
- Place focus rings on the inside when the component has at least 4px of padding; otherwise place on the outside.

### Semantic HTML

- Prefer semantic HTML elements over ARIA roles when possible (e.g., use `<button>` not `<div role="button">`).
- Use ARIA landmark roles (`role="search"`, `role="banner"`, `role="navigation"`, `role="main"`, `role="contentinfo"`) to provide clear navigation structures for screen readers.

### Viewport

- Support viewports as small as **320px × 256px** without horizontal scrolling (with exceptions for tables and videos).

---

### Avoid

* All caps copy

