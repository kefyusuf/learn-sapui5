# Example 10 - OData V4 freestyle

**Real-life scenario:** The same sales order screen as example 06 - but on the **OData V4 model**, the version every new SAP backend (RAP, CAP) speaks. V2 knowledge transfers, but the details differ - and this example teaches exactly those.

## What you'll learn

- `sap/ui/model/odata/v4/ODataModel` in the manifest (`odataVersion: "4.0"`)
- **`$`-prefixed query options** in bindings: `parameters: { $expand: 'Items' }`
- V4 is **async-first**: there is no synchronous data access at all
- `autoExpandSelect` and server-side `operationMode`
- The V4 CSDL metadata shape (`NavigationPropertyBinding` on the entity set)
- The **server-side V4 mock middleware** (`@sap-ux/ui5-middleware-fe-mockserver`) - no in-browser MockServer needed

## Run it

```bash
npm run start:10   # from the repository root
```

## V2 vs V4 - the differences that matter

| Topic | V2 (example 06) | V4 (example 10) |
|-------|-----------------|-----------------|
| Model class | `sap/ui/model/odata/v2/ODataModel` | `sap/ui/model/odata/v4/ODataModel` |
| Expand in bindings | `parameters: { expand: 'Items' }` | `parameters: { $expand: 'Items' }` |
| Data access | sync `getProperty` possible (dangerous) | **async only** - react to events |
| Metadata format | V2 CSDL | V4 CSDL + `NavigationPropertyBinding` on entity sets |
| Mock | in-browser `MockServer` | server middleware (`@sap-ux/ui5-middleware-fe-mockserver`) |
| Deprecations | several (`synchronizationMode` etc.) | current, RAP/CAP-native |

## Common mistakes here

- **M07** applies identically: the relative `{Items}` table needs the `$expand` in the list/`bindElement`.
- Forgetting the `NavigationPropertyBinding` in the metadata - `$expand` resolves nothing without it.
- Mixing V2 habits (`getProperty` right after boot) into V4 code - the model is strictly async-first.

## Common mistakes here (docs/09)

- M07 - missing `$expand`. [docs/09](../../docs/09-common-mistakes.md)
- M08 - mock service path mismatch.
- M12 - wrong `odataVersion` in the manifest.

## Try this

- Compare this controller with example 06's side by side - count the differences.
- Switch the growing list to `operationMode: "Client"` and observe the request behavior in the network tab.

Tests: `npm test` runs TWO suites headless - **unit** tests (formatters) and **three OPA5 journeys**: select an order → the `$expand`-ed items land in the detail table (two orders), and the **V4 create flow**: dialog → `ODataListBinding.create` → batch submit → the new row appears **without any manual refresh** (a V4 behavior that differs from V2). See [docs/12-testing-tdd.md](../../docs/12-testing-tdd.md).
