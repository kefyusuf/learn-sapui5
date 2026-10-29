# Example 09 - Fiori Elements: List Report + Object Page

**Real-life scenario:** The product catalog from example 04 is so typical that SAP built a generator for it: **Fiori Elements**. You describe your data with OData annotations, and SAP's templates render the standard Fiori List Report and Object Page - consistent UX, search, filters, table settings, navigation, for free. In real projects most SAP apps start as an FE app; freestyle (examples 01-08) is used when the UI must deviate from the standard.

## What you'll learn

- What Fiori Elements is and how it differs from freestyle UI5
- The **OData V4 metadata + UI annotations** that drive the templates (`UI.LineItems`, `UI.SelectionFields`, `UI.HeaderInfo`)
- The FE manifest: `sap.fe.templates` and **Component targets** for List Report and Object Page
- The FE-specific local mock server (`@sap-ux/ui5-middleware-fe-mockserver`)

## Run it

```bash
npm run start:09   # from the repository root
```

The first start downloads the large `sap.fe.templates` library once. Then you get a full List Report: filter bar, responsive table, sorting, variant management - from ~90 lines of annotations, **zero view XML and zero controller code**.

## Where the UI comes from

| You write | It produces |
|-----------|-------------|
| `metadata.xml` entity `Product` | data model, V4 protocol |
| `UI.LineItems` annotation | table columns |
| `UI.SelectionFields` | filter bar fields |
| `Measures.ISOCurrency` on Price | price formatted with currency |
| manifest `routing.targets` | List Report + Object Page navigation |

Click a row: the Object Page opens with the header info and sections - still no code of ours.

## Freestyle vs Fiori Elements (rule of thumb)

- **FE**: standard business floor lists/details, CRUD over OData, fast delivery, consistent UX.
- **Freestyle**: dashboards, unusual interactions, UIs that do not look like a list + detail.
- Real projects mix both: FE app with a freestyle custom section or a freestyle app embedding FE.

## Common mistakes here

- **M12** - blank screen after boot: data source `odataVersion` must be `"4.0"` for sap.fe, and the mock server must serve the same namespace as the manifest service uri.
- **M08** - `No entity set 'Products'`: metadata namespace/container mismatch or the fe-mockserver `urlPath` not matching the manifest `uri`.
- Forgetting `type: "Component"` on FE targets - the target loads a *template component*, not a view.

## Try this

- Add a `UI.DataFieldForAnnotation` with a `UI.DataPoint` for Stock - watch the column change.
- Add `UI.FieldGroup` annotations and see the Object Page section appear.
- Compare this repo with the freestyle catalog (example 04): same data, radically different amount of code.
