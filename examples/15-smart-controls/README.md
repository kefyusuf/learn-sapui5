# Example 15 - Smart controls

**Real-life scenario:** The form that builds itself: you declare `entitySet` + `property`, and the SmartField reads the OData $metadata — the right input control (Input, DatePicker for the date), the validation, the value help. This is the bridge topic between freestyle apps and Fiori elements: the same metadata-driven idea, one field at a time.

## What you'll learn

- `sap.ui.comp.smartform.SmartForm` with the mandatory **Group > GroupElement > SmartField** structure
- **SmartField reads the $metadata**: `Edm.DateTime` renders a DatePicker, `Edm.Decimal` validates, `Edm.String` an Input — with `entitySet` + `property` declared once per field
- The classic smart controls run on **OData V2** — their factory calls the V2 meta-model API (`getODataEntitySet`), which does not exist on V4; on V4 the successor is the `sap.ui.mdc` control set
- The V2 in-app **MockServer** (example 06's pattern) started **before** the component boot (M08)
- V2 two-way model (`twoWay: true`) + `submitChanges` → the MERGE goes automatically
- XML lessons: **namespace prefixes are case-sensitive** (M22 - the parser rejects `smartField:` when you declared `xmlns:smartfield`); **prefixed aggregation tags parse as CONTROLS** (`<smartform:content>` → `sap/ui/comp/smartform/content.js` 404) — use the default aggregations instead

## Run it

```bash
npm run start:15   # from the repository root
```

## The flow

1. index.html starts the V2 MockServer **before** the component (the first `$metadata` request must find it listening - M08).
2. The SmartForm binds via `bindElement("/SalesOrderSet('SO-1001')")`; the SmartFields declare `entitySet="SalesOrderSet"` + `property`.
3. The metadata drives the controls: Customer → Input, OrderDate → DatePicker, Total → validated Decimal input.
4. Editing writes through the V2 two-way binding; **Save** flushes with `submitChanges` → the MERGE.

## Common mistakes here

- **M22** was born here: a case-mismatched XML prefix (`smartfield` vs `smartField`) makes the parser reject the view with `prefix is unbound` — a bug a sed-based rename introduced.
- **Aggregation tags in prefixed namespaces**: `<smartform:content>` parses as a control (`sap/ui/comp/smartform/content.js` → 404) — either use the default aggregations (Group/GroupElement are controls; drop the tags) or follow the SDK samples exactly.
- **The SmartField on V4**: its factory calls the V2 meta-model API and renders NOTHING (labels from your GroupElements still show — a very convincing illusion of a working form). If your form shows labels but no inputs, check the OData version first.
- **The mock server in OPA**: an OPA page does not run index.html — the V2 mock must start in `allJourneys.js` (docs/12, M08). The symptom: the form renders but every field is empty.

## Try this

- Add annotations to the metadata (`com.sap.vocabularies.Common.v1.Label`) and watch the labels come from the metadata instead of the GroupElements.
- Add a Status SmartField with a value-help annotation.
- Switch a field to display mode (`editable="false"`) and see the SmartField render a Text instead of an Input.

## Tests

Two OPA5 journeys: the form builds itself (three SmartFields from the metadata, the mock data in the fields) and the edit round-trip (EnterText into the inner input → the two-way value lands on the SmartField).
