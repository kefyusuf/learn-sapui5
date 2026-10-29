# 09 - Common Mistakes Catalog

Real error messages from real (beginner) sessions - every entry here happened while building this repo's examples. Format: **Symptom → Cause → Wrong → Fixed → Lesson**.

---

## M01 - Bootstrap misconfigured: blank page

**Symptom:** the page is white; console shows `Failed to load resource ... /resources/sap-ui-core.js` (404) or nothing at all.

**Cause:** the bootstrap `src` is wrong (e.g. pointing to a CDN you have no access to), or `data-sap-ui-resource-roots` is missing/malformed JSON, so the app namespace cannot resolve.

**Wrong:**
```html
<script src="https://example.com/sap-ui-core.js" ...>
```
**Fixed:**
```html
<script id="sap-ui-bootstrap"
        src="resources/sap-ui-core.js"   <!-- served locally by ui5 serve -->
        data-sap-ui-resource-roots='{ "learn.helloworld": "./" }'
        data-sap-ui-theme="sap_horizon"
        data-sap-ui-compat-version="edge"
        data-sap-ui-async="true"></script>
```

**Lesson:** the bootstrap is the foundation - with `ui5 serve`, always use `resources/sap-ui-core.js`. JSON inside HTML attributes must be single-quoted outside, double-quoted inside.

---

## M02 - Namespace mismatch: component resource cannot be loaded

**Symptom:** `Error: resource learn/helloworld/Component.js could not be loaded from ...`

**Cause:** three places must agree - the resource-roots key (`"learn.helloworld"`), the manifest's `sap.app.id` (`learn.helloworld`), and the file location (`webapp/Component.ts`). A dot vs slash mixup anywhere breaks the chain.

**Lesson:** the dotted namespace in configs maps to the folder structure by replacing `.` with `/`. `learn.helloworld` must have `webapp/Component.ts` at its root. Check all three places with search-and-replace.

---

## M03 - Reading bound data too early: `undefined`

**Symptom:** `Cannot read properties of undefined (reading 'getProperty')` or your logic sees `""` although the form shows values.

**Cause:** bindings update asynchronously. Code in `onInit` right after `setModel` runs before any binding has written values back.

**Wrong:**
```ts
public onInit(): void {
    this.getView()?.setModel(new JSONModel(oData));
    const sName = this.getView()?.getModel()?.getProperty("/customer/name"); // not yet!
}
```
**Fixed:** read data in event handlers (`onSave`, `selectionChange`, route callbacks) - not in `onInit`. For display logic, use formatters (they run when the value arrives).

**Lesson:** in UI5 you *react* to data arriving; you never *poll* it after setting up a binding. (For OData this is even stricter - M09.)

---

## M04 - Raw i18n keys shown in the UI

**Symptom:** the page shows literal `appTitle`, `label.name` instead of the texts.

**Cause:** the `i18n` ResourceModel is missing in the manifest, or `bundleName` does not match the file path, or you used `{i18n>key}` while the model is named differently.

**Wrong:** view uses `{i18n>appTitle}` but the manifest has no `models.i18n`.
**Fixed:**
```json
"models": {
    "i18n": {
        "type": "sap.ui.model.resource.ResourceModel",
        "settings": { "bundleName": "learn.mvc.i18n.i18n" }
    }
}
```
(`bundleName` is the dotted path to `webapp/i18n/i18n.properties`.)

**Lesson:** `{i18n>...}` silently renders the key when the model is absent. Add the model first, then bindings "just work".

---

## M05 - `press` handler never fires / not found

**Symptom:** button does nothing; console: `handler "onSayHello" could not be found` or a TypeError inside the framework when clicking.

**Cause (a):** the view's `controllerName` has a typo - the view loads but has no controller, so handlers do not resolve.
**Cause (b):** the handler lives in a **fragment's** would-be controller - fragments have none; their handlers resolve against the **view's** controller.
**Cause (c):** TypeScript method name differs in case (`onSayhello` vs `onSayHello`).

**Lesson:** handlers always belong to the controller named by the *view* that contains the control (fragments included - they inherit the view's controller). Keep names exactly consistent.

---

## M06 - Dialog from a fragment: blank, unstyled or broken

**Symptom:** `Cannot read property 'open' of undefined`, or the dialog opens without i18n texts, or instances pile up.

**Cause:** `Fragment.load` without the view's `id` (so `this.byId` cannot find its controls) and without `addDependent` (so the dialog does not inherit the view's models); or loading a new fragment on every press.

**Wrong:**
```ts
const oDialog = await Fragment.load({ name: "x.view.ProductDialog" }); // no id, no dependent
```
**Fixed:**
```ts
if (!this.oDialog) {
    this.oDialog = await Fragment.load({
        name: "learn.controls.view.ProductDialog",
        id: this.getView()?.getId()
    }) as Dialog;
    this.getView()?.addDependent(this.oDialog);
}
this.oDialog.open();
```

**Lesson:** load once, `addDependent` always, reuse the instance.

---

## M07 - Navigation bindings show nothing (missing `$expand`)

**Symptom:** `{Category/CategoryName}` or an items table bound to `{Items}` stays empty while the master list works.

**Cause:** OData does not fetch related entities unless asked. A relative binding on a navigation property needs the navigation to be **expanded** in the same request.

**Wrong:**
```xml
<Table items="{path: '/Products'}">
    <Text text="{Category/CategoryName}" />
```
**Fixed:**
```xml
<Table items="{path: '/Products', parameters: { expand: 'Category' }}">
```
Same for `bindElement(sPath, { expand: "Items" })`.

**Lesson:** every `Something/Property` binding or relative `{Items}` binding needs a matching `$expand` one level up. Check the network tab: if the response has no nested object, the expand is missing.

---

## M08 - Mock server: metadata fails / app renders without data

**Symptom:** console `[ODataMetadata] initial loading of metadata failed` + `HTTP request failed`; tables render with "no data". Sometimes `Mandatory init() not called for UIComponent`.

**Cause (a):** the mock server was not **ready** when the OData model sent `$metadata`. `simulate()` is asynchronous in modern UI5 - starting the mock "in parallel" races the model.
**Cause (b):** "fixing" (a) by deferring `super.init()` - breaks the component lifecycle: the framework requires `init()` to complete synchronously.
**Cause (c):** `rootUri` differs from the manifest's service `uri`.

**Wrong (both halves!):**
```ts
public init(): void {
    startMockServer();          // async inside - not awaited
    super.init();               // model fires $metadata before mock is ready
}
```
```ts
public init(): void {
    startMockServer().then(() => super.init()); // init() deferred - FUTURE FATAL
}
```
**Fixed:** start the mock in `index.html` *before* creating the ComponentContainer (see examples 06/07):
```js
sap.ui.getCore().attachInit(function () {
    sap.ui.require(["learn/odata/util/mockserver", "sap/ui/core/ComponentContainer"],
        async function (mockserver, ComponentContainer) {
            await mockserver.startMockServer();
            new ComponentContainer({ name: "learn.odata", async: true, height: "100%" })
                .placeAt("content");
        });
});
```

**Lesson:** the mock server is infrastructure, not app code - start it in the boot page, keep `Component.init` synchronous.

---

## M09 - Treating OData calls as synchronous

**Symptom:** `MessageToast` shows before the row appears; "saved" is displayed although the request failed; follow-up code sees no data.

**Cause:** `create`/`remove`/`update`/binding refreshes return immediately - the response arrives later.

**Wrong:**
```ts
oModel.create("/LeaveRequestSet", oPayload);
oModel.refresh();                      // fires before the create even reaches the server
MessageToast.show("created");          // lies on error
```
**Fixed:**
```ts
oModel.create("/LeaveRequestSet", oPayload, {
    success: () => {
        (oTable.getBinding("items") as ListBinding).refresh();
        MessageToast.show("created");
    },
    error: (oError) => MessageBox.error(oError.message ?? "Create failed")
});
```

**Lesson:** every OData call gets success AND error handlers; follow-up work goes *into* them. Same rule as M03, server edition.

---

## M10 - Routing: blank page after navigation, or deprecation crash

**Symptom (a):** navigation happens but the target page is empty.
**Cause (a):** `attachPatternMatched` missing, the pattern parameter name differs from the `navTo` key, or `bindElement` never runs.

**Symptom (b):** app stays blank on load; console: `sap.ui5/routing/targets/viewPath is deprecated and not supported with manifest version 2. Use the option 'path' instead` (or `viewLevel`, or `The given type XML isn't support by sap.ui.core.routing.Target`).

**Cause (b):** with `"_version": "2.0.0"` in the manifest, old routing keys throw - and `Component.create()` rejects, so **nothing renders at all** (this exact error hit example 05 of this repo).

**Wrong (manifest v2):**
```json
"config":   { "viewPath": "app.view", "viewType": "XML", ... },
"targets":  { "detail": { "viewName": "Detail", "viewLevel": 2 } }
```
**Fixed (manifest v2):**
```json
"config":   { "path": "app.view", "viewType": "XML", ... },
"targets":  { "detail": { "type": "View", "name": "Detail", "level": 2 } }
```

**Lesson:** `viewPath`→`path`, `viewLevel`→`level`, and `type` is `"View" | "Component"` - `XML` goes into `viewType`. Also: always react with `attachPatternMatched` (only YOUR route), never `attachRouteMatched` (every route - includes your own navTo, causing loops).

---

## M11 - TypeScript: "Cannot find module" for your own code

**Symptom:** `error TS2307: Cannot find module 'learn/databinding/model/formatter'` - but the file exists!

**Cause:** the `paths` mapping in `tsconfig.json` uses the dotted namespace. Imports use slashes.

**Wrong:**
```json
"paths": { "learn.databinding/*": ["./webapp/*"] }
```
**Fixed:**
```json
"paths": { "learn/databinding/*": ["./webapp/*"] }
```
**Lesson:** `tsconfig.paths` matches the literal import string (`learn/databinding/...`), not the namespace notation. Runtime and compiler agree on slashes; only manifest ids and `sap.app.id` use dots.

---

## M12 - Manifest dataSources / real service fails

**Symptom:** `$metadata` 404, `CONNECT_REFUSED`, or "no entity set" at runtime.

**Cause:** the manifest `uri` does not match the proxy `mountPath`; `odataVersion` does not match the actual service (V2 vs V4); the backend is simply down.

**Checklist (in order):**
1. Open `<uri>$metadata` in the browser - is it XML? (Network tab first, always.)
2. `odataVersion` in `dataSources.settings` matches the service (Northwind demo = V2; RAP/CAP = V4).
3. For Fiori Elements: service **must** be V4 - a V2 service behind `sap.fe` fails with odd parser errors.
4. Proxy: see M14.

**Lesson:** with real backends, verify the service alone (browser/curl) before blaming the app.

---

## M13 - Page collapses: controls overlap the header

**Symptom:** the app renders but the content sits under the page header, the page is 44px tall, buttons unclickable.

**Cause:** the height chain is broken. UI5 apps need a chain of 100% heights: `html` → `body` → ComponentContainer → XML view → Page. If `html/body` have no height (default: content height), the container collapses to 44px (the header) and content overlaps.

**Fixed (`css/style.css` + index.html):**
```css
html, body { height: 100%; }
.sapUiComponentContainer .sapUiView { height: 100%; }
```
```html
new ComponentContainer({ name: "...", async: true, height: "100%" })
```

**Lesson:** this hit example 01 during development - the framework does not set these heights for you. Every example in this repo ships these three lines.

---

## M14 - Proxy mounts at `/`: every request goes to the backend

**Symptom:** with `ui5-middleware-simpleproxy` configured, `/index.html` returns the *backend's* response (in this repo: a Microsoft-IIS 404 from `services.odata.org`) - your app never loads at all.

**Cause:** `mountPath` was placed inside `configuration`. The UI5 CLI reads `mountPath` from the **middleware definition level**; inside `configuration` it is silently ignored, the middleware mounts at `/` and proxies *everything*.

**Wrong:**
```yaml
- name: ui5-middleware-simpleproxy
  afterMiddleware: compression
  configuration:
    mountPath: "/northwind"        # IGNORED here!
    baseUri: "https://services.odata.org"
```
**Fixed:**
```yaml
- name: ui5-middleware-simpleproxy
  afterMiddleware: compression
  mountPath: "/northwind"          # definition level - the CLI reads it here
  configuration:
    baseUri: "https://services.odata.org"
```

**Lesson:** this hit example 08 during development and cost the longest debugging session of the repo. When *every* URL returns backend content, the proxy mounted at `/` - look for `mountPath` in the wrong place first.

---

## M15 - Expression binding with raw `&&`: the view silently truncates

**Symptom:** controls after a certain point of the view simply do not exist - no error in the console (or only an unrelated warning). In this repo, the Save/Reset buttons of example 03 never rendered.

**Cause:** an expression binding inside an XML attribute containing raw `&&`:

**Wrong:**
```xml
<Button enabled="{= ${/customer/name} !== '' && ${/customer/email}.indexOf('@') > 0 }" />
```

The XML parser treats the bare `&` as the start of an entity reference and the view content after that attribute is lost. **There is no usable error message** - which is what makes this so costly.

**Fixed:**
```xml
<Button enabled="{= ${/customer/name} !== '' &amp;&amp; ${/customer/email}.indexOf('@') > 0 }" />
```

**Lesson:** inside XML attributes, escape `&&` as `&amp;&amp;` (and `<` as `&lt;`) in every expression binding. Symptom to remember: *view truncates silently at an expression binding*. This shipped in example 03 from day one and was only caught when OPA5 flow tests tried to find the save button.

---

## M16 - `Fragment.load` without `controller`: dialog buttons are dead

**Symptom:** the dialog opens, its inputs work, but the Save/Cancel buttons do absolutely nothing - no handler fires, no console error. `firePress()` on the button changes nothing either. Unit tests that call the controller method directly stay green, so nothing catches it.

**Cause:** `Fragment.load` without a `controller` option. An XML fragment has no controller of its own; its event handlers (`press="onSaveProduct"`) are only wired when the controller is passed explicitly.

**Wrong:**
```ts
this.oDialog = await Fragment.load({
    name: "learn.controls.view.ProductDialog",
    id: this.getView()?.getId()
}) as Dialog;
```
**Fixed:**
```ts
this.oDialog = await Fragment.load({
    name: "learn.controls.view.ProductDialog",
    id: this.getView()?.getId(),
    controller: this
}) as Dialog;
```

**Lesson:** every dialog fragment loaded via `Fragment.load` needs `controller: this`. This shipped in examples 04 and 07 of this repo (both dialogs completely dead) and was only caught when OPA5 journeys tried to click the buttons. Related: M06 (fragment without `addDependent` has no models).

---

## Quick reference: error → mistake

| Error fragment | Mistake |
|----------------|---------|
| `could not be loaded` (Component/Controller) | M02, M01 |
| `Cannot read properties of undefined` | M03, M05, M06 |
| literal `appTitle` in UI | M04 |
| handler not found on click | M05 |
| dialog undefined / without models | M06 |
| **dialog buttons dead, no error** | **M16** |
| empty nav binding / nested path | M07 |
| `initial loading of metadata failed` | M08, M12 |
| UI shows old data after save | M09 |
| blank app + `viewPath is deprecated` | M10 |
| `TS2307 Cannot find module` (own file) | M11 |
| `$metadata` 404 on real service | M12 |
| content under header, 44px page | M13 |
| backend answers for `/index.html` | M14 |
| **controls missing after an expression binding, no error** | **M15** |
