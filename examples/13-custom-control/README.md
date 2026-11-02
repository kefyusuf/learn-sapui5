# Example 13 - Custom control

**Real-life scenario:** Every project eventually writes one: the widget the standard library doesn't ship — here a five-star `RatingIndicator`. Writing it teaches what every `sap.m` control is made of: metadata, a renderer, event dispatch and the two-way binding contract.

## What you'll learn

- `Control.extend(name, { metadata, renderer, ...methods })` — the classic (non-decorator) form; the settings object's methods are copied onto the prototype
- **metadata**: properties (`value`, `max`), an event (`rate` with a `value` parameter) — the framework generates `getValue/getMax/fireRate` and the XML `rate="onRate"` wiring
- **renderer** (`apiVersion: 2`): pure DOM writing — one `div`, five `span` stars, `data-rate` attributes; no state, no event wiring in the renderer
- **`onclick`**: the framework dispatches browser clicks to `on<event>` handlers on the control; `oEvent.target.dataset.rate` says which star was hit
- **two-way write-back**: `setProperty` (never a raw field) fires the property change, so a bound model is updated — the same contract `sap.m`'s own controls follow
- **Clamping lives in the overridden mutator**: the classic metadata has **no** `setter` option (a key named `setter` is silently ignored) — override `setValue` on the prototype; it is called by construction (`applySettings`), clicks and the two-way binding alike

## Run it

```bash
npm run start:13   # from the repository root
```

## The flow

1. The app model is a plain `JSONModel({ rating: 2 })` — the example is about the control layer, not OData.
2. `<r:RatingIndicator value="{/rating}" rate="onRate" />` — the `xmlns:r` maps to the module namespace (resource-roots in `index.html`).
3. Clicking a star: `onclick` → `_applyRate` → `setValue` (clamped) → `setProperty` → the model gets the new value → `fireRate` → the controller shows a toast.
4. The label `You rated {/rating} / 5` re-renders from the model.

## Test split

- **Unit tests** own the LOGIC: clamping, the click path (a fake `{ target: { dataset: { rate } } }` event), the two-way model write-back, and the rendered DOM (placeAt the `qunit-fixture` + `applyChanges`, count the star spans).
- **The OPA journey** owns the INTEGRATION: the initial model value renders, a programmatic `setValue` flows through the binding and the bound label follows. The click path is deliberately NOT re-tested in OPA — tapping a custom control's exact star is DOM-geometry roulette; the unit test simulates the click deterministically.

## Common mistakes here

- **The metadata `setter` option does not exist** in the classic `extend` API — clamping must go into an overridden mutator (`setValue`). A `setter` key in the property metadata is silently ignored, so the control "works" but accepts out-of-range values.
- **`setProperty`, never the raw field** — writing `this.iValue = 3` skips the invalidation AND the two-way model write-back; nothing warns you, the binding just stops updating.
- **The renderer stays dumb** — no event wiring, no state; it only writes DOM. All behavior lives on the control.
- **`library` in the metadata** points to the app namespace (`learn.rating`) — no separate library project is needed for a control that lives inside an app.

## Try this

- Make `max` dynamic: render a 10-star variant and clamp against it.
- Add a `disabled` property: when set, `onclick` returns early and the CSS dims the stars.
- Fire `rate` only when the value actually changes (compare against the old value before `setValue`).

## Tests

Five QUnit unit tests (clamping, click path, two-way, rendering) + one OPA journey (the control inside the real app, two-way through the binding) — all headless-verified.
