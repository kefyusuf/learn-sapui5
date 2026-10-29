# Example 03 - Data binding deep dive

**Real-life scenario:** The customer service team at Acme Corp maintains customer master data in a B2B portal. You are asked to build the "contact details" screen: fields must update a live summary bar as the clerk types, the save button must only enable for valid input, and numbers/phones must be displayed properly.

## What you'll learn

- Named models and **two-way binding** (`value="{/customer/name}"`)
- **One-way bindings with formatters** (display-only values)
- **Expression binding** (`{= ... }`) for the enabled state of the save button
- The `SimpleForm` control and `sap.ui.model.type.Float` input types
- Model → UI direction via `setData()` (Reset button)

## Run it

```bash
npm run start:03   # from the repository root
```

## The four binding directions shown in one screen

| Element | Binding | Direction |
|---------|---------|-----------|
| Form inputs | `value="{/customer/name}"` | UI → model (two-way) |
| Summary bar | `parts: [...] formatter: '.formatSummary'` | model → UI (multi-part) |
| Phone display | `path: '/customer/phone', formatter: 'formatter.formatPhone'` | model → UI (formatted) |
| Save button | `enabled="{= ${/customer/name} !== '' && ... }"` | model → UI (expression) |

Type into the name field and watch: the summary bar updates immediately (`valueLiveUpdate="true"` pushes changes on every keystroke instead of on focus loss), and the save button flips enabled/disabled as the expression re-evaluates.

## Formatters

Formatting functions live in `model/formatter.ts` and are wired with `core:require` in the view root - no global variables. They receive the raw model value and return display text. Rule of thumb: **formatters never write to the model**.

## Common mistakes here

- **M03** - reading `getProperty` in `onInit` right after `setModel`: bindings update asynchronously; use a formatter or an event handler instead. [docs/09](../../docs/09-common-mistakes.md)
- **M11** - formatter functions declared as instance methods can lose `this`; keep them `static`/module-level or bind explicitly.

## Try this

- Change `valueLiveUpdate` to `false` and see when the summary updates instead (on blur).
- Extend the summary formatter to include the formatted revenue.
- Break the expression binding syntax (remove the `=`) and read the console error - you will meet it again in real projects.
