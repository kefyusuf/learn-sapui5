# 13 - Deployment: From `dist/` to a Server

The examples run locally via `ui5 serve` (dev server, transpiles on the fly). **Deployment is different**: the code is built once into static files and shipped. This guide covers what the build produces and where it can go. See the official SAP deployment documentation for tool details - this page explains the *concepts with this repo's examples*.

## What `ui5 build` produces

```bash
cd examples/01-hello-world
npm run build          # = ui5 build --clean-dest --dest dist
```

`dist/` then contains the **finished, deployable application** (verified: 34 files for example 01):

| File | Role |
|------|------|
| `Component.js`, `controller/App.controller.js` | your TypeScript, **transpiled to AMD JavaScript** |
| `*-dbg.js` + `.map` | readable debug variants + source maps |
| `Component-preload.js` | all modules + views bundled for one round trip |
| `manifest.json`, `manifest.appdescr_variant`? | app descriptor |
| `index.html`, `css/`, `i18n/`, `view/` | static assets, copied as-is |
| `.ts` sources | kept by the transpile task for in-browser debugging |

Note what is **missing**: `node_modules`, the TypeScript compiler, `ui5.yaml`, test pages - build-time concerns stay behind.

## Build variants

- `ui5 build` (default, **self-contained**): bundles the UI5 runtime libraries your app uses into `dist/resources/...` - `dist/` is truly standalone. (Examples here use `--dest dist` without self-contained bundling; add `--all`/self-contained to embed frameworks.)
- `ui5 build --all` with an **app variant**: what Fiori tools generate for BTP/ABAP deployment (adds `manifest.appdescr_variant` and an `mta.yaml` context).

## Where can `dist/` go?

### 1. Any static web server (the simplest truth)

`dist/` is plain static content. `npx serve dist` - done. For example 09's data: point the OData uri at a reachable service (see [04-odata-and-models.md](04-odata-and-models.md) - in production the app and service share one origin, so no proxy is needed).

### 2. SAP BTP - Cloud Foundry (HTML5 Application Repository)

The production pattern: an **approuter** serves the app from the HTML5 Application Repository, and destinations connect it to backend services. The build output goes there with:

- an `mta.yaml` project (UI5 + approuter modules) - `mbt build` + `cf deploy`,
- or the `ui5-task-nwabap-deployer`-style tasks / `cf html5-push` helpers from Fiori tools.

Key concept: on BTP the **app and its OData services meet through destinations and the approuter path mapping** - the manifest `uri` of examples 06-08 stays same-origin, exactly like the local proxy setup.

### 3. SAP ABAP systems

Deploy `dist/` into the ABAP server's UI5 repository (transaction `/UI5/UI5_REPOSITORY_LOAD` historically; today the **`abap-deploy-service` npm task** or Fiori tools' "Deploy to ABAP"). The app then lives beside its Gateway/RAP OData services - same-origin again.

### 4. SAP Build Work Zone (Launchpad)

Whatever the target, launchpad integration needs a ** Fiori Launchpad descriptor** (tile config: app id + semantic object) - the examples' `sap.app.id` becomes the tile's target reference.

## What changes in the code when deploying? **Nothing.**

The examples were written deployment-ready:

- all data access goes through the manifest (`dataSources`/`models`) - swap the local/proxy uri for a destination path and redeploy,
- no hardcoded localhost anywhere in `webapp/` (the proxy lives in `ui5.yaml` - a dev-only file that never ships),
- the i18n/model/routing structure is what BTP and ABAP deployment tools expect.

## Verify a build locally

```bash
cd examples/01-hello-world
npm run build
npx serve dist          # or any static server; open the printed URL
```

The transpiled app behaves identically to `ui5 serve` - that equivalence is the whole point of the build.

**CI does the same on every PR**: the workflow builds **all 10 workspaces** and uploads every `dist/` as a downloadable artifact (`ui5-dist`) - a broken build can never reach `main`, and every PR produces deployable binaries you can download and try.

## Checklist

- [ ] `npm run lint`, `npm run typecheck`, `npm test` green (CI enforces this on every PR)
- [ ] `ui5 build` succeeds, `dist/` contains the app + preload
- [ ] OData `uri` points at the target's same-origin path (or a destination)
- [ ] i18n complete (M04) - deployment does not translate anything
- [ ] App descriptor (`manifest.json`) id/title match the launchpad tile, if used
