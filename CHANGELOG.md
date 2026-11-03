# Changelog

All notable changes to this repository are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/) with an opinionated twist: the entries tell the **learning story** (what a UI5 learner gains at each step), not just the diff.

## [1.2.0] - 2026-11-03

The third milestone: two examples that push past the app itself - **into the launchpad shell** and **into metadata-driven forms**. The mistakes catalog reaches **M01-M22**, and CI gains its **first smoke gate**.

### Examples (the learning path continues)

- **14 flp-sandbox** - the app as a launchpad tile: a local Fiori launchpad shell boots the app via the **CDM bootstrap**, and a **CI smoke test** verifies the shell boot headlessly (the runner's first smoke gate). The round's real content: the "silent CDM stall" **solved** - cdm.js's cascade dies on a missing `ui5loader-dbg.js` (empty body, zero console errors), fixed by replicating the cascade with the files that exist; the CDM site schema read out of the ushell sources (`identification.title`, `appId` on the tile, manifest-style app descriptors, `deviceTypes` or the tile is dropped silently). The classic-homepage tile host remains an open, documented gap (deprecated without successor in 1.152).
- **15 smart-controls** - the form that builds itself: `SmartForm`/`SmartField` reading the OData `$metadata` (a DatePicker for `Edm.DateTime`, validated Decimal inputs) - **on OData V2**, where the classic smart controls live. The round proves the **V4 pivot**: the classic SmartField's factory calls the V2 meta-model API and on V4 renders labels with NO inputs (a convincing illusion of a working form); on V4 the successor is `sap.ui.mdc`.

### Mistakes catalog (M22)

- **M22** - XML namespace prefixes are case-sensitive: `xmlns:smartfield` declared, `<smartField:SmartField>` used - the parser rejects the view with `prefix is unbound` and no JavaScript error anywhere. Also documented: prefixed aggregation tags parse as CONTROLS (`<smartform:content>` → `sap/ui/comp/smartform/content.js` 404).

### Testing

- **The first CI smoke gate**: the runner's generic smoke mode verifies the FLP shell boot in headless Chrome.
- `scripts/diag-network.mjs` upgrades: navigation logging (an MSYS-mangled URL silently probed about:blank), the Log domain + `Runtime.exceptionThrown` capture, INFO/WARNING console capture, an async boot-state probe - the tools that cracked the FLP round.
- CI hardening: headless Chrome gets 30s to expose the DevTools websocket (a cold runner's first launch exceeded the previous 10s).

### Fixed (found by the tests)

- The forgotten M08 lesson re-learned: the V2 mock must start in `allJourneys.js` - an OPA page does not run index.html; the symptom was a fully rendered form with every field empty.
- M18 re-confirmed: with matchers, OPA `success` receives ONE control - counting goes in the `check` (the all-candidates rule).

## [1.1.0] - 2026-11-02

The second milestone: three more examples (11-13) complete the freestyle arc - the modern master-detail pattern, the app that talks back, and the first hand-written control. The mistakes catalog grows to **M01-M21**, and the headless runner becomes a debugging instrument.

### Examples (the learning path continues)

- **11 flexible-column-layout** - the Fiori 2.0 master-detail pattern, taught through the **no-routing FCL pattern** (the App controller drives the columns; the routing-based variant stalls in headless runs and is documented as such). Three columns, V4 update via `Context.setProperty`, V4 delete via `Context.delete()` - four OPA journeys.
- **12 message-manager** - the intake form that talks back: `handleValidation` routes `Edm.Decimal` parse errors into the MessageManager, the bell counts them, the MessagePopover lists them; the transient create pattern (`ODataListBinding.create()` + a two-way bound dialog). Two OPA journeys.
- **13 custom-control** - a hand-written five-star `RatingIndicator`: metadata, an apiVersion-2 renderer, `onclick`, and the two-way write-back contract. Five unit tests + one journey. Includes the lesson that the classic metadata has **no `setter` option** - clamping belongs in the overridden mutator.

### Testing (the runner becomes an instrument)

- Failed pages now print the **failing assertion details** and the **console errors** - the real cause, not just the test name.
- **M21 guard**: the runner refuses to start when the port already answers - a zombie `ui5 serve` from a crashed run serves stale in-memory mock state (a DELETE from a previous run!) and every test against it is garbage. The guard caught eight zombies on its first outing.
- `scripts/diag-network.mjs` - a CDP probe that opens the OPA page and **decodes the `$batch` MIME payloads**; the tool that proved a `204 No Content` DELETE while `Context.delete()`'s promise never settled.
- **20 test pages green** across 01-13 (was 16).

### Mistakes catalog (M17-M21, all found by the tests)

- **M17** - `ColumnListItem` defaults to `type="Inactive"`: inactive rows swallow presses, `itemPress` never fires.
- **M18** - OPA `waitFor` with `controlType` + `check`: the check receives ALL candidates at once; the per-control filter is a matcher function.
- **M19** - a fragment's `{/...}` binding goes to the DEFAULT model - in V4 apps that is the service: `Failed to read path` on every dialog open.
- **M20** - V4 DELETE on an `$expand`-ed collection: no auto-update, `refresh()` unsupported, the delete promise may never settle - unbind + re-bind for a clean re-read.
- **M21** - the zombie `ui5 serve`: every test run silently tests a stale server.

### Documentation

- docs/12: the OPA5 lessons from examples 11/12 (Inactive rows, matcher vs check, the MessageBox "Close" button, blocking popups) + a new **"Diagnosing a red journey"** playbook.
- The learning path and the root README list examples 11-13; `start:10` - `start:13` scripts added (10-11 had been missing while the READMEs referenced them).

### Fixed (found by the tests)

- The edit dialog bound `{/edit/...}` against the OData V4 default model - console errors on every dialog open, invisible in green journeys (M19).
- `ResourceModel` has no `getText` in 1.152 - a typecheck fix had quietly replaced `getResourceBundle().getText()` and broken the delete confirm at runtime; the OPA journey caught it.
- Example 11's third-column flow: rows without `type="Active"` rendered fine but never fired `itemPress` (M17).

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
