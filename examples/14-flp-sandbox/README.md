# Example 14 - FLP sandbox

**Real-life scenario:** Every SAP project ships its apps inside the **Fiori launchpad** — and the first question a new UI5 developer asks is "how does my app become a tile?". This example boots a **local launchpad shell** (no BTP, no gateway) with the app registered as a tile, and — for the first time in this repo — **verifies the shell boot headlessly in CI**.

## What you'll learn

- The **CDM bootstrap** (`sap/ushell/bootstrap/cdm.js` era): the launchpad shell, the home page and tiles come from a **site configuration**, not from your app
- The **CDM site schema** (read out of the ushell sources): `site.payload.groupsOrder` → `groups` (`identification.title`!) → tiles (`appId` on the tile) → `applications` (manifest-style descriptors with `crossNavigation.inbounds` **and** `deviceTypes`)
- The **trap that killed the naive sandbox**: cdm.js's cascade requests `ui5loader-dbg.js`, which this runtime doesn't ship — the cascade **dies silently on its own 404** (empty body, zero console errors). The fix: replicate the cascade with the files that exist (bootstrap + `autoboot="false"` + `cdm-def-dev` + `Core.boot()`)
- **CI smoke verification**: the runner polls the rendered shell for the site's group title — the first smoke gate in this repo's CI

## Run it

```bash
npm run start:14   # from the repository root
npm run start --workspace examples/14-flp-sandbox   # same thing
# then open http://localhost:8096/test/flpSandbox.html  (the shell) or / (the app)
```

## The flow

1. `test/flpSandbox.html` sets `window["sap-ushell-config"]` with the app's **site data** (group → tile → application descriptor with a navigation inbound).
2. The bootstrap runs with `autoboot="false"`; `cdm-def-dev` registers the CDM configuration; `Core.boot()` starts the shell.
3. The shell navigates to `#Shell-home` and renders the site's groups — headless-verified by the smoke test.
4. The tile click would open the app (`SAPUI5.Component=learn.flp`, `url: "../"`) inside the shell.

## Known gap (documented, not hidden)

The shell boots and renders the **groups**; the **tile host does not render tiles** in this setup. The entire classic-homepage chain (`LaunchPageAdapter` V2, `DashboardGroupsContainer`) is `@deprecated "together with the classic homepage"` in UI5 1.152 — the tile's applauncher component is even created, the deprecated host does not place it. Closing this means migrating the sandbox to the modern home renderer. The full diagnosis is in [docs/12-testing-tdd.md](../../docs/12-testing-tdd.md).

## Common mistakes here

- **The silent CDM stall**: an empty body with ZERO console errors is not "the shell is slow" — it is cdm.js's cascade dying on a missing dbg variant. Look at the network requests, not the console.
- **`identification.title`**, not `title`: the CDM group reads its display name from `identification`.
- **`deviceTypes` on the inbound**: without them the tile is dropped by the form-factor check — **an INFO log, invisible to console.error**. The diag tool (`scripts/diag-network.mjs`) exists for exactly this class of silent drop.
- **MSYS note (Git Bash on Windows)**: passing `/test/flpSandbox.html` as an argument gets path-mangled — prefix `MSYS_NO_PATHCONV=1`.

## Try this

- Add a second application to the site data and watch the group grow.
- Give the tile a `sap-icon` and a `subTitle` in the visualization payload.
- Port the sandbox to example 12's MessageManager app — the site data is app-agnostic.

## Tests

One CI smoke gate: the sandbox page renders the site's group (`My Apps`) in headless Chrome — the first launchpad-shell verification in this repo's CI.
