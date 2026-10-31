# Learn SAP UI5 by Doing

[![CI](https://github.com/kefyusuf/learn-sapui5/actions/workflows/ci.yml/badge.svg)](https://github.com/kefyusuf/learn-sapui5/actions/workflows/ci.yml)

A hands-on learning repository for **complete UI5 beginners**: 9 progressively harder, fully working **TypeScript** applications, each built around a real-life business scenario - plus a catalog of the mistakes everyone actually makes (including the ones made while building this repo).

**Verified**: every example runs, renders and passes `tsc --noEmit` on SAPUI5 **1.152** with Node 20+.

## Quick start

```bash
git clone <this-repo> && cd sapui5
npm install          # one install for all 9 examples (npm workspaces)
npm run start:01     # opens http://localhost:8081
npm test             # headless QUnit suites (Chrome required)
```

Ports 8081-8087 and 8089-8090 serve examples 01-09 (08 runs on 8090 - port 8088 can collide with local services on some Windows machines). `npm run typecheck` checks all examples.

## The learning path

| # | Example | Real-life scenario | You learn | Data |
|---|---------|--------------------|-----------|------|
| [01](examples/01-hello-world/README.md) | hello-world | First screen at a new job | Boot chain, manifest, first view/controller | local |
| [02](examples/02-mvc-i18n/README.md) | mvc-i18n | HR intranet welcome card | MVC split, lifecycle, i18n | local |
| [03](examples/03-data-binding-forms/README.md) | data-binding-forms | Customer master data form | Two-way binding, formatters, expression binding | local |
| [04](examples/04-controls-lists-dialogs/README.md) | controls-lists-dialogs | Product catalog for sales | Lists, search, fragments, dialogs | local |
| [05](examples/05-routing-master-detail/README.md) | routing-master-detail | Sales orders for inside sales | Routes, parameters, deep linking | local |
| [06](examples/06-odata-mockserver/README.md) | odata-mockserver | Sales orders on OData | OData V2, $metadata, $expand, MockServer | mocked |
| [07](examples/07-crud-leave-request/README.md) | crud-leave-request | Leave request self-service | Full CRUD, validation, confirm flows | mocked |
| [08](examples/08-real-odata-northwind/README.md) | real-odata-northwind | Live product list | Real backend, CORS + proxy | **live** |
| [09](examples/09-fiori-elements-products/README.md) | fiori-elements-products | Product List Report | Fiori Elements from annotations | mocked (V4) |

Start at 01 and go in order - each example only uses what the previous ones taught. Full roadmap and time estimates: [docs/11-learning-path.md](docs/11-learning-path.md).

## The mistakes catalog (read this twice)

[docs/09-common-mistakes.md](docs/09-common-mistakes.md) maps **real error messages** to their causes - every entry occurred while building this repo, for example:

- `Mandatory init() not called for UIComponent` - starting an async mock server the wrong way (M08)
- `viewPath is deprecated and not supported with manifest version 2` - routing config that blanks the whole app (M10)
- The proxy that silently swallowed the entire app because `mountPath` sat in the wrong YAML level (M14)
- The page that collapsed to 44px and made buttons unclickable - the missing height chain (M13)

When an error message looks familiar, look it up there first.

## Documentation

| Doc | Content |
|-----|---------|
| [01-getting-started](docs/01-getting-started.md) | Install, toolchain, project anatomy |
| [02-mvc-and-app-structure](docs/02-mvc-and-app-structure.md) | MVC, lifecycle, manifest |
| [03-data-binding-deep-dive](docs/03-data-binding-deep-dive.md) | Bindings, formatters, models |
| [04-odata-and-models](docs/04-odata-and-models.md) | OData, CRUD, mock server, CORS |
| [05-routing](docs/05-routing.md) | Routes, targets, deep linking |
| [06-freestyle-vs-fiori-elements](docs/06-freestyle-vs-fiori-elements.md) | Choosing the app architecture |
| [07-typescript-in-ui5](docs/07-typescript-in-ui5.md) | The TS setup and its traps |
| [08-debugging](docs/08-debugging.md) | Console, network tab, Diagnostics window |
| [09-common-mistakes](docs/09-common-mistakes.md) | **The catalog: M01-M14** |
| [10-glossary](docs/10-glossary.md) | SAP jargon decoded (RAP, CAP, CDS, FLP...) |
| [11-learning-path](docs/11-learning-path.md) | Roadmap with time estimates |
| [12-testing-tdd](docs/12-testing-tdd.md) | QUnit harness, TDD cycle, branch → commit → PR workflow |
| [13-deployment](docs/13-deployment.md) | What `ui5 build` produces and where `dist/` can go (BTP/ABAP/static) |

## Technical facts

- **SAPUI5 1.152.0**, theme `sap_horizon`, `sap.m` controls
- **TypeScript** with `@sapui5/types`, transpiled by `ui5-tooling-transpile` (ESM sources → AMD, no manual build)
- **@ui5/cli v4** with npm workspaces - one `npm install` for all examples
- Mocked services run locally (`sap.ui.core.util.MockServer` for V2, `@sap-ux/ui5-middleware-fe-mockserver` for V4); example 08 uses the public Northwind demo service via `ui5-middleware-simpleproxy`

## Contributing

Found an error message that cost you hours? Add it to the catalog - [CONTRIBUTING.md](CONTRIBUTING.md) explains the format. PRs that keep every example runnable are always welcome.

## License

[MIT](LICENSE)
