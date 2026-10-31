# 11 - Learning Path

Work through the examples **in order** - each one uses only what the previous ones taught. Time estimates assume 1-2 hours per example including the "Try this" exercises.

## The path

| # | Example | Scenario | Core skills | Est. |
|---|---------|----------|-------------|------|
| 01 | [hello-world](../examples/01-hello-world/README.md) | Your first screen at a new job | Boot chain, manifest, view+controller, byId, MessageToast | 1h |
| 02 | [mvc-i18n](../examples/02-mvc-i18n/README.md) | HR intranet welcome card | MVC split, lifecycle, i18n model, resource bundle | 1-2h |
| 03 | [data-binding-forms](../examples/03-data-binding-forms/README.md) | Customer master data form | Two-way binding, formatters, expression binding, SimpleForm | 2h |
| 04 | [controls-lists-dialogs](../examples/04-controls-lists-dialogs/README.md) | Product catalog for the field | Lists, search/filter, fragments, dialogs, footer actions | 2-3h |
| 05 | [routing-master-detail](../examples/05-routing-master-detail/README.md) | Sales order list + detail | Routes/targets, parameters, deep linking, back navigation | 2-3h |
| 06 | [odata-mockserver](../examples/06-odata-mockserver/README.md) | Same app, real data model | OData V2, $metadata, $expand, MockServer, bindElement | 3h |
| 07 | [crud-leave-request](../examples/07-crud-leave-request/README.md) | Leave request self-service | create/remove, validation, confirm dialogs, refresh patterns | 3-4h |
| 08 | [real-odata-northwind](../examples/08-real-odata-northwind/README.md) | Live product list | Real backend, CORS + proxy, error handling | 1-2h |
| 09 | [fiori-elements-products](../examples/09-fiori-elements-products/README.md) | Product List Report, generator-style | FE templates, V4 annotations, Component targets | 2h |

Total: roughly 3-4 focused days to the end of the path.

## After each example

1. Run it and **click through everything**.
2. Open the browser console - understand every warning you see.
3. Do the "Try this" exercises in the example's README.
4. Look up every error you can produce deliberately in [09-common-mistakes.md](09-common-mistakes.md) - recognizing error messages is a core skill.

## Companion docs while you go

| Doc | Read when |
|-----|-----------|
| [01-getting-started](01-getting-started.md) | before example 01 |
| [02-mvc-and-app-structure](02-mvc-and-app-structure.md) | with example 02 |
| [03-data-binding-deep-dive](03-data-binding-deep-dive.md) | with example 03 |
| [08-debugging](08-debugging.md) | whenever something does not work (so: always) |
| [04-odata-and-models](04-odata-and-models.md) | with examples 06-08 |
| [05-routing](05-routing.md) | with example 05 |
| [07-typescript-in-ui5](07-typescript-in-ui5.md) | with example 01 (setup) and whenever a TS error confuses you |
| [06-freestyle-vs-fiori-elements](06-freestyle-vs-fiori-elements.md) | before example 09 |
| [10-glossary](10-glossary.md) | whenever SAP jargon appears |

## What to learn next (beyond this repo)

- **Deployment**: build with `ui5 build` and deploy to SAP BTP / an ABAP system - see [13-deployment.md](13-deployment.md).
- **Fiori launchpad integration**: app descriptors, tile configuration, FLP sandbox for local development.
- **Testing**: QUnit/OPA5 (UI5's test frameworks) and `ui5-test-runner`.
- **RAP / CAP backends**: build your own OData V4 service that example-09-style FE apps consume.
- **Flexibility**: UI adaptation (key user / developer extensibility) for FE apps.

## A note on how this repo was built

Every example in this repo was verified by actually running and clicking through it, and every mistake in [09-common-mistakes.md](09-common-mistakes.md) occurred during that process. When an error message there looks familiar - that is on purpose.
