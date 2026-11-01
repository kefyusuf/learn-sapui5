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

## M17 - `ColumnListItem` without `type`: rows look fine, `itemPress` never fires

**Symptom:** the table renders perfectly, tapping a row does nothing in the app, and in an OPA5 journey the `Press` action completes silently - but the `itemPress` handler never runs. No error anywhere.

**Cause:** `ColumnListItem`'s `type` defaults to `Inactive` - inactive items swallow press events. Selection-based navigation (`selectionChange`) keeps working because the list's selection mode handles the tap, which is why the master list works while the "same-looking" items table doesn't.

**Wrong:**
```xml
<ColumnListItem vAlign="Middle">
    <cells>...</cells>
</ColumnListItem>
```
**Fixed:**
```xml
<ColumnListItem vAlign="Middle" type="Active">
    <cells>...</cells>
</ColumnListItem>
```

**Lesson:** any row you tap for navigation needs `type="Active"` (or `Navigation`, which also shows a chevron). This bit example 11's third-column flow and was found only because the OPA journey kept timing out on the item detail. Related: M16 (handlers wired but never called).

---

## M18 - OPA `waitFor` with `controlType` + `check`: the check gets ALL candidates

**Symptom:** an OPA journey step searching by `controlType` throws `TypeError: oRow.getCells is not a function` (or `oFCL.getLayout is not a function`) inside its own `check` - even though the controls exist and the type is right.

**Cause:** with a `controlType` search, OPA passes **every matching control at once** into `check` - not each control individually. `check` is meant for id-based waits where exactly one control arrives. The per-control filter API is a **matcher** (or a matcher function).

**Wrong:**
```ts
this.waitFor({
    controlType: "sap.m.ColumnListItem",
    check: (oRow) => oRow.getCells()[0].getText() === "..." // boom
});
```
**Fixed:**
```ts
this.waitFor({
    controlType: "sap.m.ColumnListItem",
    matchers: (oRow) => oRow.getCells()[0].getText() === "...", // per control
    actions: new Press()
});
```

**Rule of thumb:** `id` + `check` (one control) vs. `controlType` + `matchers` (filter per control). Both bugs in this round surfaced only through the journeys - the unit suite stayed green.

---

## M19 - Fragment bindings against the OData V4 default model: `Failed to read path`

**Symptom:** console errors like `Failed to read path /edit/order - TypeError: Cannot read properties of undefined (reading '$kind')` on every dialog open. The bound control renders empty (and an OData type may throw a `FormatException` trying to format the missing value).

**Cause:** a dialog fragment binds UI state with `{/edit/order}` - an **absolute path into the DEFAULT model**. In a V4 app the default model is the OData service, so the model tries to read `/edit/order` as an entity set that does not exist.

**Fixed:** dialog-local state goes on a NAMED JSON model set by the controller:
```ts
this.oDialog.setModel(new JSONModel({ edit: { order: sOrderId } }), "ui");
```
```xml
<Text text="{ui>/edit/order}" />
```

**Lesson:** `{/...}` means "the default model" - in V4 apps that is the service. Anything that is not service data (dialog state, UI flags) needs a named model. Found in example 11's edit dialog; the OPA journeys kept passing (they read the control directly) while the console filled with errors - another reason the headless runner now prints console errors. Related: M18.

---

## M20 - V4 DELETE on an `$expand`-ed collection: no auto-update, no `refresh()`, a promise that never settles

**Symptom:** `Context.delete()` resolves the HTTP side fine (the batch shows `204 No Content`) but the table keeps the deleted row forever. Calling `.refresh()` on the list binding throws `Uncaught Error: Refresh on this binding is not supported`.

**Cause:** three stacked V4 facts, each found one at a time:
1. The OData V4 model does **not** auto-update data of an `$expand`-ed navigation property after a write.
2. V4 bindings do **not** support `refresh()` (the V2-era way to force a re-read is gone).
3. `Context.delete()`'s promise **may never settle** when the parent's expanded cache cannot be reconciled - so `await`-ing it for the UI update silently skips the update code.

**Fixed:** drop the element binding (which releases the model cache) and re-bind - the fresh GET sees the post-delete data:
```ts
oContext.delete(); // fire - do not await it for the UI update
const sOrderPath = oDetailView.getBindingContext()?.getPath();
oDetailView.unbindElement();
oDetailView.bindElement({ path: sOrderPath, parameters: { $expand: "Items" } });
```

**Lesson:** in V4, "the UI updates itself" is true for PATCH on the bound entity (`Context.setProperty`), NOT for writes into `$expand`-ed collections. Found in example 11's delete flow; the OPA journey caught it (the row stayed) while the DELETE itself looked successful.

---

## M21 - The zombie `ui5 serve`: every test run silently tests a stale server

**Symptom:** tests pass/fail in ways that do not match the code at all - e.g. a journey suddenly cannot find an entity that exists in the mock data. Restarting changes nothing. `netstat` shows the port `LISTENING` even though no server should be running.

**Cause:** an earlier run's `ui5 serve` survived teardown (a failed `taskkill` tree on Windows) and still holds the port. The headless runner's `waitForServer` saw the port answering and happily ran the tests against the **zombie** - whose in-memory state was from BEFORE: mock data it had already mutated (a DELETE from a previous run persisted in its RAM, not on disk).

**Fixed:** the runner now refuses to run when the port already answers before spawning:
```js
if (await get(`http://localhost:${t.port}/`)) {
    console.log(`port ${t.port} already answers - kill the zombie server first`);
    process.exitCode = 2;
}
```

**Lesson:** "is anything listening on this port?" is not the same as "is MY server listening?". Diagnosed by serving the same workspace on a different port and diffing the responses - the fresh server returned the deleted entity, the zombie did not. Also found in example 11's delete round.

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
| **row tap does nothing - `itemPress` never fires, no error** | **M17** |
| **`getCells/getLayout is not a function` inside an OPA `check`** | **M18** |
| **`Failed to read path /...` on every dialog open** | **M19** |
| **row stays after DELETE; `Refresh on this binding is not supported`** | **M20** |
| **tests pass/fail against data that is not in the mock files** | **M21** |
