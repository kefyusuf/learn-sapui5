# Contributing

Thanks for considering a contribution to this learning repository! The goal of this repo is to teach SAP UI5 to complete beginners, so clarity matters more than cleverness.

## How to contribute

1. **Fixes** — typos, broken links, outdated API usage, or code that no longer runs. Open a pull request with a short description of what was wrong.
2. **New mistakes** — found an error message that cost you hours? Add it to `docs/09-common-mistakes.md` using the existing format: *Symptom → Cause → Wrong code → Fixed code → Lesson*. Real error messages are gold.
3. **New examples** — propose it as an issue first. Examples must:
   - Run standalone with `npm install` + `npm start` (no backend required, or a public demo service via the proxy middleware).
   - Use TypeScript, SAPUI5 1.152+ and `sap.m` controls.
   - Start from a **real-life business scenario**, not a technical demo.
   - Link into `docs/11-learning-path.md`.

## Ground rules

- Keep every example **runnable at all times**. Never commit code that fails `npm run ts-typecheck`.
- Prefer the simplest control that solves the scenario. This is a beginner repo.
- Comments explain *why*, not *what*.
- Follow the existing file layout of the numbered examples exactly.
- All documentation is written in English.

## Local check before you submit

From the repository root:

```bash
npm install          # installs all workspaces once
npm run lint         # ui5lint across all workspaces
npm run typecheck    # TypeScript checks every example
npm test             # headless QUnit suites (example 03 pilot; more on the way)
npm run start:01     # or the example you changed
```

If you changed an example, open it in the browser and click through the main flow before submitting.

## Workflow: TDD → commit/branch → PR

Work test-first (see [docs/12-testing-tdd.md](docs/12-testing-tdd.md)): write the failing test, make it pass, then open a branch (`feature/...` / `fix/...`), commit with a conventional message - code and tests in the same commit - and open a PR against `main` once `npm run typecheck` and `npm test` are green.
