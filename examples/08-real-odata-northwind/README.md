# Example 08 - Real OData: Northwind products

**Real-life scenario:** Your team finally got a real backend - not mocked. You now learn what changes when the data truly lives on a server: network latency, error handling, CORS and $filter decisions. We use SAP's classic demo OData V2 service (Northwind) - no registration needed.

## What you'll learn

- Talking to a **real OData V2 service** (no MockServer)
- **CORS in development** and the `ui5-middleware-simpleproxy` fix
- `$expand` across a real navigation property (`Category/CategoryName` in bindings)
- Growing tables against live data, search filtering
- Graceful "service unreachable" handling

## Run it

```bash
npm run start:08   # from the repository root
```

Requires internet access. The proxy in `ui5.yaml` mounts `/northwind` to `https://services.odata.org`:

```yaml
- name: ui5-middleware-simpleproxy
  configuration:
    mountPath: "/northwind"
    baseUri: "https://services.odata.org"
```

## Why the proxy?

Browsers block cross-origin XHR unless the server allows it (CORS). Demo services usually don't. In production SAP solves this because the app and the OData service live on the same host (same-origin). In development, the UI5 CLI proxy makes the app believe the service is local. This is a fact of life you will hit in your first week with real backends - better to meet it here.

## Common mistakes here

- **M12** - `404 $metadata` / connection refused: manifest `uri` does not match the proxy `mountPath`, or the backend is down. Check the network tab first.
- **M07** - `{Category/CategoryName}` shows nothing: `Category` was not `$expand`ed in the binding parameters.
- Filtering server-side vs client-side: with growing tables, a client-side filter only sees loaded rows. Production apps send `$filter` via binding parameters.

## Try this

- Stop your internet and reload - read the error and the `noDataText` handling.
- Add `parameters: { operationMode: 'Server' }` and convert the search into a real `$filter` request - watch the network tab.
