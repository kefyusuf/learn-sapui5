# 06 - Freestyle vs Fiori Elements

The biggest architectural decision in an SAP UI5 project. Compare [example 04](../examples/04-controls-lists-dialogs/README.md) (freestyle catalog) with [example 09](../examples/09-fiori-elements-products/README.md) (Fiori Elements catalog of the same data).

## What Fiori Elements is

A set of **application templates** (`sap.fe.templates`): List Report, Object Page, Worklist, Overview Page. You do not write views or controllers - you describe your business data with **OData metadata + annotations**, and the template renders the standard Fiori UX: filter bar, responsive table, variant management, navigation, drafts.

| You write (example 09) | Produces |
|------------------------|----------|
| `metadata.xml` with entity `Product` | the data model (OData V4) |
| `UI.LineItems` annotation | the table columns |
| `UI.SelectionFields` | the filter fields |
| `Measures.ISOCurrency` on Price | price with currency formatting |
| `UI.HeaderInfo` | the Object Page header |
| manifest `routing.targets` with `type: "Component"`, `name: "sap.fe.templates.ListReport"` | the pages themselves |

The application class extends `sap.fe.core.AppComponent` - and contains **zero lines of UI logic**.

## When to choose which

**Fiori Elements first** - it is the SAP standard, delivers in days, and stays consistent with the rest of Fiori:

- classic list + detail over an OData service (CRUD, drafts)
- approved processes: purchase orders, sales orders, leave requests

**Freestyle** when the UI must deviate:

- dashboards, visualizations, custom interactions
- UIs not shaped like "list with filter bar"
- special widgets, games, wizards

**Both together**: real projects embed freestyle custom sections/actions into FE apps (`sap.fe` extension APIs), or navigate between a freestyle app and an FE app.

## What FE costs you

- Your backend must be **OData V4** (RAP, CAP) with well-modeled annotations.
- Debugging is harder: the framework generates the UI, so you debug *configuration*.
- Anything non-standard requires extension points - if your UI fights the template, switch to freestyle.

## Rule of thumb for learners

Learn freestyle first (examples 01-08) - it teaches you the machinery (models, bindings, routing, controllers) that FE automates. Then example 09 shows how much of that machinery the template replaces. Understanding both makes you the person who can judge which one a project needs.
