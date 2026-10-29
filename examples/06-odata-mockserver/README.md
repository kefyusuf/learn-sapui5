# Example 06 - OData and MockServer

**Real-life scenario:** Same sales order screen as example 05 - but this time the data comes from an OData service, like every serious SAP backend. The backend does not exist yet, so you build against a **mock server** that answers OData requests from local files. When the real service arrives, you change one URI and the app still works.

## What you'll learn

- What OData is: entity sets, `$metadata`, `$expand`
- The **manifest dataSources** section and the default OData V2 model
- **MockServer**: local `metadata.xml` + JSON mock data, simulated latency
- `bindElement` with `$expand`, relative bindings for a detail table
- Separating **backend data** (OData model) from **UI state** (`"ui"` JSON model)

## Run it

```bash
npm run start:06   # from the repository root
```

Tests: `npm test` runs TWO suites headless - **unit** tests (formatters) and the **OPA5 integration** journey: selects a real row in the OData table (matched by `BindingPath` on the row's entity path) and verifies the `$expand`-ed items land in the detail table. The OPA page starts the mock server itself - an OPA run does not execute the app's `index.html` boot chain. See [docs/12-testing-tdd.md](../../docs/12-testing-tdd.md).

Open the browser network tab (F12) and reload: every request to `/sap/opu/odata/sap/ZSALESORDERS_SRV/...` is intercepted and answered by the mock server - you can see the OData protocol in action.

## The pieces

| File | Role |
|------|------|
| `localService/metadata.xml` | the service's entity types (SalesOrder, SalesOrderItem) |
| `localService/data/*.json` | mock data per entity set |
| `util/mockserver.ts` | intercepts requests; started **before** `super.init()` |
| `manifest.json > sap.app.dataSources` | declares the service (uri + localUri) |
| `manifest.json > models > ""` | the default OData model using that data source |

The mock server delays each response by 200 ms (`autoRespondAfter`) so you can watch the busy indicators - train your eyes for real backends.

## Common mistakes here

- **M08** - `404 resource ZSALESORDERS_SRV/...` or `no mock data for SalesOrderSet`: MockServer not started before the model, or `rootUri` differs from the manifest `uri`. [docs/09](../../docs/09-common-mistakes.md)
- **M07** - items table empty: forgot `$expand` - relative navigation bindings (`{Items}`) need the navigation property to be expanded or the context to contain it.
- Reading `getProperty` right after `bindElement` (M03/M09): OData is asynchronous; react in callbacks/events, never assume data is there.

## Try this

- Delete a line from `SalesOrderSet.json`, reload, and see the list change.
- Change `autoRespondAfter` to 2000 and watch the busy state.
- Point `uri` at a non-existing service and read the console errors - recognizing a metadata 404 is a daily skill.
