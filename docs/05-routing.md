# 05 - Routing

Routing turns your app into pages with URLs - back button, bookmarks and email links work. See it live in [example 05](../examples/05-routing-master-detail/README.md).

## The three pieces

1. **A navigation container** - `sap.m.App` in the root view:

```xml
<mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc">
    <App id="app" />
</mvc:View>
```

2. **The routing section of the manifest**:

```json
"routing": {
    "config": {
        "routerClass": "sap.m.routing.Router",
        "viewType": "XML",
        "path": "learn.routing.view",
        "controlId": "app",
        "controlAggregation": "pages",
        "async": true
    },
    "routes": [
        { "name": "list",   "pattern": "",                 "target": "master" },
        { "name": "detail", "pattern": "detail/{orderId}", "target": "detail" }
    ],
    "targets": {
        "master": { "type": "View", "name": "Master", "level": 1 },
        "detail": { "type": "View", "name": "Detail", "level": 2 }
    }
}
```

`controlId`/`controlAggregation` say where created views are placed. Pattern parameters (`{orderId}`) become route arguments.

3. **Router calls in code**:

```ts
import UIComponent from "sap/ui/core/UIComponent";

// navigate
UIComponent.getRouterFor(this).navTo("detail", { orderId: "SO-1002" });

// initialize in Component.init (once!)
this.getRouter().initialize();
```

```ts
// react - ONLY to pattern matched of YOUR route
UIComponent.getRouterFor(this).getRoute("detail")?.attachPatternMatched(this.onMatched, this);

public onMatched(oEvent: { getParameter(name: "arguments"): object | undefined }): void {
    const { orderId } = oEvent.getParameter("arguments") as { orderId: string };
    this.getView()?.bindElement("/orders/" + index);
}
```

## Back navigation with a fallback

```ts
public onNavBack(): void {
    const sPreviousHash = History.getInstance().getPreviousHash();
    if (sPreviousHash !== undefined) {
        window.history.go(-1);
    } else {
        UIComponent.getRouterFor(this).navTo("list", {}, true); // bReplace: no history entry
    }
}
```

## Deep linking for free

Because the router drives the hash, `.../index.html#/detail/SO-1002` opens the detail page directly - even on a cold start. Test it in example 05, including a non-existing id (`#/detail/SO-9999`): your `attachPatternMatched` handler should handle the not-found path and navigate back.

## Manifest version 2 gotcha (M10)

With `"_version": "2.0.0"` in the manifest, the old routing keys **throw** (not just warn):

| Old (manifest v1) | Modern (v2) |
|-------------------|-------------|
| `viewPath` in config | `path` |
| `viewLevel` in targets | `level` |
| target without `type` | `"type": "View"` (or `"Component"` for Fiori Elements) |

Real error: `sap.ui5/routing/targets/viewPath is deprecated and not supported with manifest version 2. Use the option 'path' instead` - and the whole app stays blank, because `Component.create()` rejects.

## Common mistakes

- M10 - blank page after navigation: `attachPatternMatched` missing, parameter name mismatch, or deprecated manifest keys. [docs/09](09-common-mistakes.md)
- Reacting to `attachRouteMatched` instead of `attachPatternMatched` - fires for every route, causes loops.
- Calling `navTo` inside `onInit` of the target view.
