# 14 - Performance and Accessibility

Two quality dimensions that separate a demo from a production app. This guide collects the essentials with pointers into the examples - the patterns are already in place, this page explains **why** they matter.

## Performance

### 1. Preload and lazy-load views

- The manifest's `rootView` and routing `targets` load views **lazily by default** - a route's view loads only when the user navigates there (example 05's Detail view loads on the first navigation).
- Keep it that way: never preload every view "to be safe" - each view adds script size and render cost.
- `data-sap-ui-preload="sync"` is legacy; async boot (`data-sap-ui-async="true"`, used in every example) is the performance-correct default.

### 2. One preload for the app

`Component-preload.js` (built by `ui5 build`, see [13-deployment.md](13-deployment.md)) bundles the app's modules and views into **one request** - in production the app boots with a single fetch instead of dozens.

### 3. OData: ask for what you need

- `$expand` only where the UI reads the navigation (examples 06/10) - over-expanding fetches data the UI drops.
- `autoExpandSelect: true` (example 10) lets the V4 model derive the minimal `$select` from the bindings - fewer bytes over the wire.
- `operationMode: "Server"` keeps filtering/paging on the backend - the client only receives visible rows.
- Growing tables (`growing="true"`, examples 04/06/08) fetch pages instead of everything.

### 4. Batch your writes

V2: `submitBatch` groups create/update/remove into one `$batch` request. V4: automatic grouping (`submitBatch("$auto")`, example 10's create flow). Fewer round trips, atomic-ish UX.

### 5. Keep the boot chain lean

The height-chain and boot lessons in the mistakes catalog (M01/M13) are also performance rules: a broken boot wastes a full reload cycle. `ui5lint` catches deprecated/unsafe patterns before they cost runtime.

## Accessibility (a11y)

UI5 does the heavy lifting **by default** - the controls ship with ARIA roles, keyboard handling and theming contrast built in. What YOU add:

### 1. Texts for everything visible

- `alt`/`tooltip` on images and icons: `<Image alt="Employee portrait">` (example 02).
- Icons that only decorate need `decorative: true` - icons that carry meaning need a text.

### 2. Label/control association

- Every input gets a `Label` with `labelFor` (examples 02/03/07): screen readers announce the label when the input focuses.
- `<Label text="Name" labelFor="nameInput" />` + `<Input id="nameInput" />` - the pairing is the contract.

### 3. Semantic states

- `ObjectStatus` with `state` (Success/Warning/Error) instead of raw colors - screen readers announce the state, and color-blind users get the text (examples 04/06/08).
- Never encode meaning in color alone.

### 4. Keyboard: it already works - keep it

- UI5 controls implement the FIORI keyboard spec (tab chains, F4 helpers, arrow keys in tables). Your job: don't break it - avoid custom `onkeydown` handlers that swallow keys, prefer control events (`press`, `liveChange`).
- The dialogs in examples 04/07/10 are focus-trapped by the framework; `Escape` closes them if you map the close handler.

### 5. Test with the tools

- Chrome DevTools → Accessibility panel: inspect the ARIA tree of any running example.
- SAP's a11y statement template + the Fiori a11y guidelines are the acceptance criteria for production apps.

## Rule of thumb

**Performance**: fetch less, load lazily, bundle once. **A11y**: label everything, use semantic states, trust the framework's keyboard handling - and test with the accessibility panel, not your eyes.
