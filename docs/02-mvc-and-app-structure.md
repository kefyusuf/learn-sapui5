# 02 - MVC and App Structure

UI5 is an MVC framework with strong opinions. Understanding *who owns what* prevents 80% of beginner confusion. See it live in [example 02](../examples/02-mvc-i18n/README.md).

## The three parts

| Part | Where | Contains | Never contains |
|------|-------|----------|----------------|
| **Model** | `JSONModel` / `ODataModel` instances | data | UI logic |
| **View** | `view/*.view.xml` | controls, bindings, ids | data manipulation |
| **Controller** | `controller/*.controller.ts` | event handlers, lifecycle | layout details |

A fourth file glues them: **`manifest.json`**, the app descriptor. It declares the app id, required libraries, the root view, named models (i18n, OData services) and routing - all as configuration, not code.

## The boot chain

```
index.html  →  UI5 core loads
    └─ ComponentContainer (name: "learn.mvc")
          └─ Component.ts  (metadata: { manifest: "json" })
                └─ manifest.json
                      └─ rootView: view/App.view.xml
                            └─ controllerName: controller/App.controller.ts
```

Beginner rule: **names must match exactly**. The `data-sap-ui-resource-roots` namespace in index.html must equal `sap.app.id` in the manifest; the view's `controllerName` must equal the controller's namespace. One typo and you get the famous "resource could not be loaded" (M02).

## Controller lifecycle hooks

```ts
export default class AppController extends Controller {
    public onInit(): void { /* create models, attach route handlers */ }
    public onBeforeRendering(): void { /* rarely needed */ }
    public onAfterRendering(): void { /* DOM-dependent code */ }
    public onExit(): void { /* cleanup */ }
}
```

`onInit` runs **once** per view instantiation - the standard place for `setModel`, router hooks and one-time setup.

## Finding controls: byId and prefixes

`this.byId("nameInput")` finds a control **in the same view**. UI5 prefixes ids with the view/component (`__component0---app--nameInput`) - that is why you never hardcode the global id and why fragment-loaded dialogs need the view's id passed to `Fragment.load` (M06).

## i18n in three levels

1. **Manifest**: `"models": { "i18n": { type ResourceModel, bundleName "learn.mvc.i18n.i18n" } }`
2. **Views/metadata**: `text="{i18n>appTitle}"`, manifest placeholders `{{appTitle}}`
3. **Controller code**: `getResourceBundle().getText("greeting.message", [name])`

Never hardcode user-visible text in a view - screens get translated, hardcoded strings do not (M04).
