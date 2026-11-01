# Example 11 - FlexibleColumnLayout

**Real-life scenario:** The modern freestyle master-detail pattern: a list on the left, the detail on the right — the layout adapts to the screen size (Fiori 2.0). This is THE pattern for freestyle apps that need more than a simple list.

## What you'll learn

- The `sap.f.FlexibleColumnLayout` control: One/Two/Three column layouts
- The **no-routing FCL pattern**: the App controller drives the columns manually
- The Detail view: created lazily on the first selection, `bindElement` per selection
- The **third column**: tapping an item row opens the item detail in the end column (`ThreeColumnsMidExpanded`), Close returns to two columns
- The V4 update flow: the edit-status dialog sends the PATCH via `Context.setProperty`
- The V4 list + `$expand` on OData V4 (the same data as example 10)

## Run it

```bash
npm run start:11   # from the repository root
```

## The no-routing FCL pattern

The FCL apps traditionally use the `sap.f.routing.Router` with the layout switching per route. **This example uses the simpler no-routing pattern**: the App controller places the Master view into the begin column, attaches to the table's `selectionChange` and drives the Detail view + the layout switches manually.

Why: the routing-based variant stalled in headless verification (the Master view never populated — documented in [docs/12-testing-tdd.md](../../docs/12-testing-tdd.md)); the no-routing pattern works everywhere and is easier to follow for learners. The trade-off: no deep-linking via the hash — acceptable for this teaching example (the routing-based FCL remains the pattern for FE apps).

One navigation owner: the App controller drives ALL columns — including the third. The ItemDetail view is deliberately controller-less (its Close button is wired by the App controller after creation); see [M16](../../docs/09-common-mistakes.md) for why a `press=` attribute in a controller-less view would be a dead handler.

## The flow

1. The App controller places the Master view into the begin column (`OneColumn`).
2. Selecting an order creates the Detail view lazily, adds it to the mid column (`TwoColumnsMidExpanded`) and binds it with `$expand: "Items"`.
3. The items table fills from the expanded navigation — one round trip.
4. Tapping an item row creates the ItemDetail view lazily, adds it to the end column (`ThreeColumnsMidExpanded`) and binds it to the item's context.
5. Close returns to `TwoColumnsMidExpanded` — the column keeps its state for the next item.

## Common mistakes here

- **M07** applies: the relative `{Items}` table needs the `$expand` in the `bindElement`.
- **M17** was born here: `ColumnListItem` defaults to `type="Inactive"` — inactive rows swallow presses, so `itemPress` never fires without `type="Active"`.
- The layout switches: `setLayout("ThreeColumnsMidExpanded")` — the FCL's aggregations are managed by the framework; don't add views to the wrong column.

## Try this

- Add a back-to-list button in the Detail view's header (the FCL's `beginColumnNavigate` event).
- Delete an item from the third column with the V4 model's `remove` on the list binding — then verify the items table shrinks by itself.

## Tests

Three OPA5 journeys (headless-verified): select → detail, edit status (PATCH), and item → third column → close.
