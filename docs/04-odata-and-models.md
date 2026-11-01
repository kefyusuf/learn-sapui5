# 04 - OData and Models

OData is the protocol SAP backends speak. UI5 has first-class models for it. See it live in examples [06](../examples/06-odata-mockserver/README.md), [07](../examples/07-crud-leave-request/README.md), [08](../examples/08-real-odata-northwind/README.md) and [10](../examples/10-odata-v4/README.md).

## OData in one paragraph

An OData service exposes **entity sets** (`/Products`, `/SalesOrderSet`) of typed **entities**, described by a machine-readable **`$metadata`** document. Clients filter (`$filter`), page (`$top/$skip`), and read related entities in one round trip (`$expand`). V2 (most SAP Gateway services) and V4 (SAP RAP / Fiori Elements default) differ in details - UI5 has a model class for each. **New projects start with V4**: example [10](../examples/10-odata-v4/README.md) is the V4 twin of examples 06/07.

## V2 vs V4 - the write patterns

| Topic | V2 (examples 06/07) | V4 (example 10) |
|-------|---------------------|-----------------|
| Create | `oModel.create(path, data, { success })` + manual `refresh` | `ODataListBinding.create` - transient row → batch, no refresh |
| Update | `oModel.update(path, data, { success })` + manual `refresh` | `Context.setProperty` → PATCH, bindings update themselves |
| Delete | `oModel.remove(path, { success })` + manual `refresh` | `Context.delete` — list updates itself |
| Data access | sync `getProperty` possible (dangerous) | **async only** - react to events |

## Declaring the service in the manifest

```json
"sap.app": {
    "dataSources": {
        "mainService": {
            "uri": "/sap/opu/odata/sap/ZSALESORDERS_SRV/",
            "type": "OData",
            "settings": { "odataVersion": "2.0", "localUri": "localService/metadata.xml" }
        }
    }
},
"sap.ui5": {
    "models": {
        "": { "dataSource": "mainService", "settings": { "defaultBindingMode": "TwoWay" } }
    }
}
```

The default model (`""`) is what plain bindings like `{/SalesOrderSet}` and `{ID}` use. `localUri` points at a local copy of the metadata - used by the mock server and by code completion tooling.

## Bindings against OData

```xml
<!-- list with navigation property expanded in one request -->
<Table items="{path: '/SalesOrderSet', parameters: { expand: 'Items' }}">
    ...
    <Text text="{Customer}" />
    <Text text="{Items}" />   <!-- relative: needs the $expand above -->
```

```ts
// point a whole view at one entity
this.getView()?.bindElement("/SalesOrderSet('SO-1001')", { expand: "Items" });
```

## CRUD (example 07)

```ts
const oModel = this.getView()?.getModel() as ODataModel;

oModel.create("/LeaveRequestSet", oPayload, { success: fnDone, error: fnFail });
oModel.update("/LeaveRequestSet('LR-0001')", oPayload, { success: fnDone, error: fnFail });
oModel.remove("/LeaveRequestSet('LR-0001')", { success: fnDone, error: fnFail });
```

The CRUD checklist: **validate first, always pass success AND error handlers, refresh the affected binding in success, tell the user what happened, confirm destructive actions.**

## The mock server (examples 06/07)

`sap.ui.core.util.MockServer` intercepts all XHR to the service URI in the **browser** and answers from local files:

- `localService/metadata.xml` - the entity model
- `localService/data/<EntitySet>.json` - the data (writes modify in-memory copies; a refresh resets them)

Two rules that cost beginners hours:

1. **Start the mock before the component is created** (see the `index.html` of examples 06/07). `simulate()` is asynchronous in modern UI5.
2. `rootUri` must match the manifest `uri` exactly.

## Real backends and CORS (example 08)

Browsers block cross-origin XHR unless the server allows it. In production the app and service share one host (SAP Fiori launchpad) - no CORS. In development, the UI5 CLI proxies the service: `ui5.yaml` declares `ui5-middleware-simpleproxy` with `mountPath` (top level of the middleware definition, **not** inside `configuration` - M14!) and the manifest `uri` uses that path.

## Common mistakes

- M07 - missing `$expand` for navigation bindings.
- M08 - mock server race / uri mismatch.
- M09 - assuming OData calls finished when the code returns.
- M12 - metadata 404s / wrong odataVersion.
- M14 - proxy `mountPath` in the wrong place.
