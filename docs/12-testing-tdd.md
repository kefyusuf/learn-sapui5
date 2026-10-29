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

What to test first in a UI5 project: **pure modules** (formatters, validators, calculations). Controller tests come next (sinon stubs for views/models); OPA5 integration tests drive whole flows - both are natural follow-ups.

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
