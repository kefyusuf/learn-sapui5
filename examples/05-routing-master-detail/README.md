# Example 05 - Routing: master-detail

**Real-life scenario:** Inside sales reps at Acme Corp work from a sales order list. Clicking an order must open its details - and the browser back button and bookmarks must work, because reps email links like `.../detail/SO-1002` to each other. That is exactly what the UI5 router gives you.

## What you'll learn

- The **routing section of the manifest**: routes, patterns, targets
- `App` navigation container and `controlAggregation: "pages"`
- `navTo` with parameters and `attachPatternMatched`
- `bindElement` to point a whole view at one entity
- Back navigation with `History` + fallback

## Run it

```bash
npm run start:05   # from the repository root
```

## How a click becomes a page change

1. `Component.init()` calls `this.getRouter().initialize()` - the router reads the manifest.
2. The list item press handler calls `navTo("detail", { orderId: "SO-1002" })`.
3. The router matches pattern `detail/{orderId}`, instantiates `Detail.view.xml` (from `targets.detail.viewName`) and adds it to the `App` pages.
4. `attachPatternMatched` in `Detail.controller.ts` receives `{ orderId: "SO-1002" }`, finds the order in the model and calls `bindElement` - after that every relative binding in the view (`title="{id}"`, `items="{items}"`) shows this order.
5. Change the URL manually to `#/detail/SO-9999` and reload - deep linking and the not-found path both work.

## Common mistakes here

- **M10** - a blank detail page after navigation: `attachPatternMatched` missing or the pattern parameter name in the manifest differs from the `navTo` object key. [docs/09](../../docs/09-common-mistakes.md)
- **M10** - infinite loop: calling `navTo` inside `onInit` of the target view reacts to its own navigation. React to *pattern matched*, navigate from *user actions*.
- Browser history breaks when using `navTo` with `bReplace: true` incorrectly.

## Try this

- Add a `?query=` optional parameter to the detail pattern and read it from `arguments["?query"]`.
- Bookmark a detail URL, then start the app - notice the router goes *directly* to the detail page. That is deep linking for free.
