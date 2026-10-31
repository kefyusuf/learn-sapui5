# Changelog

All notable changes to this repository are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/) with an opinionated twist: the entries tell the **learning story** (what a UI5 learner gains at each step), not just the diff.

## [1.0.0] - 2026-11-01

The first complete milestone: **10 progressive examples, a three-layer test suite, CI quality gates and 13 documentation guides** - everything reachable through the TDD workflow (test-first → branch → commit → green CI → PR → protected main).

### Examples (the learning path)

- **01 hello-world** - boot chain, manifest, first view/controller
- **02 mvc-i18n** - MVC split, lifecycle, i18n model
- **03 data-binding-forms** - two-way binding, formatters, expression binding
- **04 controls-lists-dialogs** - lists, search, fragments, dialogs
- **05 routing-master-detail** - routes, parameters, deep linking, back navigation
- **06 odata-mockserver** - OData V2 model + in-browser MockServer
- **07 crud-leave-request** - full CRUD against mocked OData
- **08 real-odata-northwind** - a real backend via the dev proxy (CORS)
- **09 fiori-elements-products** - FE List Report from annotations (V4)
- **10 odata-v4** - the V4 twin of 06: `$`-prefixed options, async-first, transient-row create

### Testing (three layers, one runner)

- `scripts/test-headless.mjs` - dependency-free headless runner (DevTools protocol, real-time polling); `npm test` covers **16 test pages across 01-08 + 10**
- **Unit layer**: formatters and validators of every data example
- **Controller layer**: sinon-sandbox tests (add-product, delete-flow, greeting)
- **OPA5 layer**: 7 journeys/pages - boot smoke, form, dialog create, navigation x2, deep-link, back-nav, OData selection/$expand, create, delete via a real MessageBox

### CI (GitHub Actions)

- Gates on every PR and push to main: **ui5lint → typecheck → headless tests → ui5 build (all workspaces) → `ui5-dist` artifact upload**
- Branch protection on `main`: required check, strict up-to-date, linear history

### Documentation (13 guides)

Getting started, MVC, data binding, OData (V2+V4), routing, FE comparison, TypeScript, debugging, **the mistakes catalog (M01-M16)**, glossary, learning path, **testing/TDD workflow**, deployment.

### Fixed (found by the tests)

- `formatPhone` grouped ten digits 4-3-2-1 → spec fixed to 4-3-3
- **M15**: a raw `&&` in an expression binding silently truncated the view (the save button never rendered)
- **M16**: `Fragment.load` without `controller: this` left dialog buttons dead in two examples
- Missing dates slipped into a `NaN` day count → new `error.missingDates` rule
- Silent no-selection delete → visible `error.selectRow` information

## [Unreleased]

- FE (example 09) OPA5 harness research: `sap/fe/test/JourneyRunner` + FLP sandbox (the standalone boot blocker is documented in docs/12)
- Example 05: deep-link journey shipped; back/deep-link variations of the other apps welcome
