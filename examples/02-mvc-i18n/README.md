# Example 02 - MVC structure and i18n

**Real-life scenario:** The HR department at Acme Corp wants a small intranet widget: an employee welcome card that will later be embedded in the company portal. It must be translatable from day one because Acme has offices in three countries. (We keep it to one language file here - `i18n_en_US.properties` shows how variants work.)

## What you'll learn

- The **MVC split**: XML view (structure), controller (behavior), model (data)
- `onInit` lifecycle hook and `JSONModel`
- **i18n model** in the manifest, `{{key}}` placeholders in metadata, `{i18n>key}` bindings
- Getting texts programmatically with `getResourceBundle()` and parameters (`{0}`)

## Run it

```bash
npm run start:02   # from the repository root
```

Tests: `npm test` runs the headless QUnit suite for this example (`webapp/test/unit/`) - controller tests verifying that `onInit` attaches the employee model and that `onSayHi` greets the employee **by name through the i18n bundle** (the fake bundle echoes keys and args, so the tests verify exactly how the greeting is composed). See [docs/12-testing-tdd.md](../../docs/12-testing-tdd.md).

## Key concepts

### The three parts of MVC in UI5

| Part | File | Owns |
|------|------|------|
| Model | `JSONModel` created in the controller | data |
| View | `view/App.view.xml` | layout, bindings, no logic |
| Controller | `controller/App.controller.ts` | event handlers, model setup |

### i18n, three levels

1. **Bundle in the manifest**: the `models > i18n` section declares a `ResourceModel` pointing at `learn.mvc.i18n.i18n`.
2. **Declarative use**: `title="{i18n>appTitle}"` in views and `"title": "{{appTitle}}"` in the manifest (double braces there!).
3. **Programmatic use**: `getResourceBundle().getText("greeting.message", [name])` for texts you compose at runtime.

### Translations

Copy `i18n_en_US.properties` to e.g. `i18n_de.properties` and change a few lines; browsers configured for German will pick it up automatically.

## Common mistakes here

- **M04** - raw keys like `appTitle` shown in the UI: the `i18n` model is missing in the manifest, or the `bundleName` does not match the folder/file path. [docs/09](../../docs/09-common-mistakes.md)
- **M05** - `press` handler never fires: handler name typo or the view's `controllerName` is wrong.

## Try this

- Add a `label.location=Location` key in both `.properties` files and a fourth `Text` line in the view.
- Remove the `i18n` model from the manifest, reload, and watch raw keys appear - now you will recognize M04 forever.
