# Example 01 - Hello World

**Real-life scenario:** You just joined the development team at Acme Corp. Before you get your first ticket, your lead asks you to deliver the smallest possible UI5 app: a screen with your name on it. This is that screen - and the skeleton you will reuse in every project.

## What you'll learn

- How a UI5 app boots: `index.html` → bootstrap → `manifest.json` → `Component` → view
- What the **app descriptor** (`manifest.json`) does
- Your first **XML view** and **TypeScript controller**
- `byId()`, the `press` event and `MessageToast`

## Run it

```bash
# from the repository root
npm install
npm run start:01
# or from this folder
npm install && npm start
```

Then open http://localhost:8081 (the start script opens it automatically).

Tests: `npm test` runs TWO suites headless - **unit** tests (the greeting falls back to "world" for empty input) and an **OPA5 smoke** journey: the app boots, the greeting screen renders and the toast appears after pressing the button. See [docs/12-testing-tdd.md](../../docs/12-testing-tdd.md).

## The boot chain, step by step

1. **`index.html`** loads the UI5 runtime (`resources/sap-ui-core.js`, served locally by the UI5 CLI) and maps the app namespace to this folder:

   ```html
   data-sap-ui-resource-roots='{ "learn.helloworld": "./" }'
   ```

2. After the core is ready, a **`ComponentContainer`** instantiates the component by name (`learn.helloworld`) and renders it into `<body>`.

3. **`manifest.json`** is the app descriptor. Its `sap.app.id` must match the namespace used above. The `sap.ui5.rootView` section tells UI5 which view to show first.

4. **`Component.ts`** is the application object. It only declares `manifest: "json"` - everything else is configuration, not code.

5. **`view/App.view.xml`** declares controls declaratively. `controllerName` connects it to the controller; `press="onSayHello"` connects a button event to a controller method.

6. **`controller/App.controller.ts`** contains the logic. `this.byId("nameInput")` finds a control declared in the same view.

## Common mistakes here

| # | Symptom | Doc |
|---|---------|-----|
| M01 | Blank page, `404` for `/resources/...` or wrong bootstrap | [docs/09-common-mistakes.md](../../docs/09-common-mistakes.md) |
| M02 | `Error: resource learn/helloworld/Component.js could not be loaded` - namespace mismatch | same doc |
| M13 | Page collapses / button overlaps the header - missing height chain | same doc |
| M11 | TypeScript import not found - `paths` missing in `tsconfig.json` | same doc |

## Try this

- Change the button text and reload - notice that XML views need **no build step** while controllers are transpiled on the fly.
- Change `"text"` of the `Page` title in the view, then move it to the manifest's `sap.app.title` - see how many places can own a "title".
- Deliberately break `controllerName` (typo it) and read the browser console - recognizing that error message is a rite of passage (see M05).
