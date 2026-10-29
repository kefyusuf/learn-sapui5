# 01 - Getting Started

Everything you need before example 01 runs.

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 20 or newer | `node -v` |
| npm | 9 or newer | `npm -v` |
| A browser | Chromium-based recommended | - |

No SAP account, no SAP Business Technology Platform, no backend needed for examples 01-07 and 09. Example 08 calls a public demo OData service and needs internet access.

## Install and run

```bash
# from the repository root - installs all examples at once (npm workspaces)
npm install

# run any example
npm run start:01        # opens http://localhost:8081
npm run start:05        # opens http://localhost:8085
# ... ports 8081-8087/8089 for examples 01-09 (08 uses 8090)
```

TypeScript is checked without running anything:

```bash
npm run typecheck
```

## What "running a UI5 app" actually means

There is no compile step you trigger manually. `ui5 serve` starts a small development server that:

1. serves your `webapp` folder as the site root,
2. serves the UI5 runtime libraries from a local cache under `/resources` (downloaded once per version into `~/.ui5`),
3. transpiles your TypeScript to browser-ready AMD JavaScript on request (`ui5-tooling-transpile`),
4. runs project middlewares (proxy, mock server).

So: edit a file, refresh the browser. XML views and CSS need no transpilation at all.

## Project anatomy (identical in every example)

```
example-XX/
├── package.json          # name, scripts, dev dependencies (UI5 CLI, types, transpiler)
├── ui5.yaml              # UI5 project config: framework version, middlewares
├── tsconfig.json         # TypeScript config (types: @sapui5/types, namespace paths)
└── webapp/               # the application - THIS is what you edit
    ├── index.html        # bootstrap: loads UI5, mounts the component
    ├── manifest.json     # app descriptor: id, models, libraries, routing
    ├── Component.ts      # application object (small!)
    ├── view/             # XML views: layout + bindings, no logic
    ├── controller/       # TypeScript: event handlers, app logic
    ├── model/            # formatters / helpers (optional)
    ├── i18n/             # translatable texts
    └── css/              # styles
```

## Editor setup

VS Code works out of the box - the repo's `tsconfig.json` gives you full code completion for every UI5 class (`sap.m.Button`, `ODataModel`, ...) through the `@sapui5/types` package. Install the "ESLint" extension if you want linting.

## Next

Open [11-learning-path.md](11-learning-path.md) and start with example 01.
