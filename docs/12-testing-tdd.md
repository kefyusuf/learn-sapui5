# 12 - Testing and the TDD Workflow

How tests run in this repo, and the git workflow that goes with them: **RED → GREEN → branch → commit → PR**.

## Test stack (deliberately minimal)

- **QUnit 2** - ships inside the UI5 runtime itself (`/resources/sap/ui/thirdparty/qunit-2.js`). No test framework download needed.
- **Headless Chrome** - the runner in `scripts/test-headless.mjs` starts `ui5 serve` for each example, loads the QUnit page in headless Chrome and parses the rendered results. `npm test` from the repo root runs everything; `node scripts/test-headless.mjs 03` runs one example.

Why not Karma? karma-ui5 boots the full UI5 project graph inside Karma and stalled on this setup. The dump-and-parse runner uses exactly the same technique as the manual browser verification - one moving part, zero extra dependencies. If you prefer Karma/`ui5-test-runner`, the test pages work unchanged (they are plain QUnit 2 pages).

## Where tests live

```
webapp/
├── model/formatter.ts                # production code (pure functions)
├── model/validator.ts                # production code (pure functions)
└── test/unit/
    ├── unitTests.qunit.html          # QUnit page (bootstrap + QUnit 2 + allTests.js)
    ├── allTests.js                   # requires all test modules, then QUnit.start()
    └── model/
        ├── formatter.test.js
        └── validator.test.js
```

Three details that cost setup time (all hit while building this harness):

1. **Root-absolute resource paths** (`/resources/...`) in the test page - relative ones break from nested folders.
2. **`data-sap-ui-resource-roots`** must map the app namespace (`"learn.databinding": "/"`), otherwise the loader requests app modules under `/resources/learn/...` and the browser refuses them (MIME type error).
3. **Named exports after transpilation**: an ESM `export const formatter = {...}` becomes an AMD module returning `{ formatter: {...} }`. In tests, destructure: `sap.ui.define(["learn/databinding/model/formatter"], function (oModule) { const formatter = oModule.formatter; ... })`.

## The TDD cycle

1. **RED** - write the test for the behavior you want *first*, with a stub that throws `not implemented`. Run `npm test` and watch it fail for the *right reason*.
2. **GREEN** - implement the simplest code that passes. Run again.
3. **Refactor** - clean up with the tests as a safety net; they must stay green.

The pilot cycle in example 03 paid off immediately: the characterization tests for `formatPhone` exposed a real formatting bug that shipped in the app (`"0555 112 23 3"` - a ten-digit number split 4-3-2-1). The spec was fixed to 4-3-3, formatter updated, app corrected.

The second cycle (example 07) shows the *extraction* pattern: the validation rules lived inline in the controller; they were pulled into `model/validator.ts` **test-first** - including a new `error.missingDates` rule, because the tests documented that missing dates would previously flow into the day calculation and produce `NaN`.

## Controller tests: instantiate, stub, await

Example 04's `controller/App.test.js` is the pattern for testing a controller **without a view**:

1. `new AppController()` - controllers instantiate standalone.
2. Stub the view layer: `sinon.stub(oController, "getView")` / `"byId"` return fakes (plain objects with the methods the code touches: `getValue`, `setValue`, `getSelected`).
3. Stub the boundaries you cannot have in a unit test: `MessageBox.error`, `MessageToast.show` (statics) and the i18n model (a fake bundle that echoes keys, so assertions verify *which* message shows).
4. `await` the async handler, then assert on state (model changed) and interactions (dialog closed, error shown).

Two runtime traps, both hit while building this:

- **Sinon comes from the UI5 runtime**: `sap/ui/thirdparty/sinon-4` - and its UMD wrapper registers with the UI5 loader, so require it through the loader; `window.sinon` does not exist.
- **Sinon 4 has no top-level `restore`** (that arrived in sinon 5): use `sinon.createSandbox()` per test and `sandbox.restore()` in `afterEach`, otherwise you get `Attempted to wrap ... which is already wrapped` on the second test.

Covered today: example 03 (formatters + email validator), example 07 (leave-request validation + day calculation), examples 04/06/08 (formatter characterization) and example 05 (status/total formatters extracted from the controllers test-first), example 04 add-product flow (controller + sinon). Next candidates: OPA5 integration tests that drive whole flows in the real UI.

## OPA5: flow tests against the real app

`test/integration/` holds OPA5 journeys: they boot the **real component** and drive real controls. The runner handles them like unit pages (real-time polling - virtual time budgets are incompatible with OPA5's waits). Five traps, all hit while building this:

1. The QUnit integration module is **`sap/ui/test/opaQunit`** (not `opa5QUnit`).
2. `Opa5` must be **imported explicitly** (`sap/ui/test/Opa5`) - there is no global.
3. Actions take **option objects**: `new EnterText({ text: "..." })` - a bare string is treated as an ID.
4. With `Opa5.extendConfig({ viewNamespace: "learn.databinding.view." })`, `waitFor({ viewName: "App" })` uses the **short name** - the full name gets double-prefixed and matches nothing (silent 20s timeout).
5. OPA5 waits in **real time** - virtual-time-budget runners expire before the app boots; the CDP polling runner exists for exactly this reason.

The example 03 journey found **M15** on its first run: the save button it was supposed to click did not exist because a raw `&&` truncated the view. The example 04 and 07 journeys found **M16** the same way: `Fragment.load` without `controller: this` left every dialog button dead.

### OPA5 rollout lessons (examples 04/05/07)

- **A closing dialog is async** - after pressing save, the handler runs a round trip before `close()`. Assert with a **`check` function that polls** (`check: oDialog => oDialog.isOpen() === bOpen`), never a one-shot `success` assertion.
- **A closed dialog has no DOM** - with the default `visible: true` OPA waits for a rendered control that will never come back. Set `visible: false` when asserting state (`isOpen`) instead of visibility.
- **DatePickers/Selects wrap an inner input** - target it with `new EnterText({ text, idSuffix: "inner" })`.
- **No `.and()` chaining inside page objects** - `this.waitFor(...).and(...)` is journey-syntax only; use two page methods and chain in the journey.
- **OData apps: start the mock server in `allJourneys.js`** before the journeys - an OPA page does not run the app's `index.html` boot chain (docs/09, M08).
- **Pressing a list item**: the old `ItemMatcher` was removed from UI5 - filter with `controlType: "sap.m.StandardListItem"` + `new PropertyStrictEquals({ name: "title", value: ... })` and let `Press` act on the matched item (example 05 journey).
- **`id` + `controlType` form an AND pipeline** - `waitFor({ id: "ordersTable", controlType: "sap.m.ColumnListItem" })` can never match (the id is the table, the controlType wants its rows). Drop the id and filter rows by **`new BindingPath({ path: "/SalesOrderSet('SO-1002')" })`** - the OData-idiomatic row matcher (example 06 journey).
- **The Page's auto nav button has no id** - it is the only `sap.m.Button` in the detail view, so `waitFor({ viewName: "Detail", controlType: "sap.m.Button", actions: new Press() })` suffices (example 05 back journey). Deep-link journeys (`iStartMyUIComponent` + `hash`) need more investigation for standalone boots - follow-up.

## CI

`.github/workflows/ci.yml` runs `npm run typecheck` + `npm test` on every PR and every push to `main` (ubuntu-latest, Node 24, the preinstalled Chrome via `CHROME_BIN`). A PR is only mergeable when both are green - the same two commands you run locally.

## Git workflow: branch → commit → PR

```bash
# one branch per unit of work, always from up-to-date main
git switch main && git pull
git switch -c feature/<topic>

# ... TDD: red, green, refactor ...

git add <files>
git commit -m "feat: <what> - <why>"     # tests included in the same commit
git push -u origin feature/<topic>
gh pr create --base main --fill          # or open the PR in the browser
```

Conventions in this repo:

- Branch names: `feature/...`, `fix/...`, `chore/...`.
- Commit messages: conventional-commit style prefix (`feat|fix|chore|docs|test`) + imperative summary; every feature commit ships its tests.
- A PR is only opened when `npm run typecheck` and `npm test` pass.
- The PR body lists what changed, what was verified and any new mistakes for [09-common-mistakes.md](09-common-mistakes.md).
