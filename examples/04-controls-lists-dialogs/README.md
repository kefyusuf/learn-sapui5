# Example 04 - Controls essentials: lists, search, fragments, dialogs

**Real-life scenario:** The sales team at Acme Corp asks for a product catalog for the field: a searchable list with price and availability at a glance, and an "Add product" dialog for the back office. Every Fiori app you will ever build combines these pieces.

## What you'll learn

- `List` + `ObjectListItem` with statuses, and list **growing** (lazy loading)
- `SearchField` with a live **filter on the items binding** (`sap.ui.model.Filter`)
- **Fragments**: reusable XML without a controller
- `Dialog` loaded via `Fragment.load`, ownership (`addDependent`) and id handling
- Footer toolbar with an emphasized action button

## Run it

```bash
npm run start:04   # from the repository root
```

## Why a fragment for the dialog?

A `Dialog` is a popup - it does not belong to the page layout. Keeping it in `ProductDialog.fragment.xml`:

1. keeps `App.view.xml` clean (layout only),
2. makes it reusable in other views,
3. teaches the **id trick**: loaded with the view's id, the fragment's `addDialog` is still reachable via `this.byId("addDialog")`.

`addDependent(this.oDialog)` connects the dialog to the view's lifecycle - without it the dialog would not inherit the models of the view (a classic trap, M06 in the mistakes catalog).

## Common mistakes here

- **M06** - dialog opens blank or without models: loaded the fragment without `addDependent`, or created it per press and leaked instances.
- **M05** - `press` handler not found: the fragment has **no controller**; its handlers resolve against the *view's* controller.
- Filtering the model data directly instead of the binding - breaks search + add together.

## Try this

- Add a second filter on `category` and search both fields at once (multi-filter).
- Move the two status formatters into expression bindings and compare readability.
- Show a `MessageStrip` inside the dialog instead of the `return` on validation errors.
