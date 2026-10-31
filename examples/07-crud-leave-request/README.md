# Example 07 - Full CRUD: leave requests

**Real-life scenario:** HR self-service at Acme Corp: employees view their leave requests, submit a new one (validated before it goes anywhere), and can withdraw a pending one. Every Fiori project eventually does create/update/delete - this example does it the way production code does.

## What you'll learn

- `ODataModel.create()` and `remove()` with success/error callbacks
- **Client-side validation before the request** (empty employee, end < start)
- Refreshing a list binding after a write (`refresh()`)
- `MessageBox.confirm` for destructive actions
- A form dialog fragment with `DatePicker`, `Select`, `TextArea`

## Run it

```bash
npm run start:07   # from the repository root
```

Tests: `npm test` runs TWO suites headless - **unit** tests (`model/validator.ts` + controller tests for the create and delete flows: visible validation feedback, confirmation with the interpolated id, remove on the selected path) and TWO **OPA5 integration** journeys: create a leave request through the real dialog and **delete the selected request through the real MessageBox** (`searchOpenDialogs`) against the mocked OData service. The journeys caught **M16** - the dialog's buttons were dead because `Fragment.load` was missing `controller: this`. See [docs/12-testing-tdd.md](../../docs/12-testing-tdd.md).

The mock server simulates writes: a POST adds a row to its in-memory data, a DELETE removes it. Refresh the browser and your data is back - mocks reset, backends don't.

## The CRUD checklist this example follows

1. **Validate** inputs in the controller before any request.
2. **Send** the create/remove with success AND error handlers - never fire-and-forget.
3. **Refresh** the affected binding in the success handler.
4. **Tell the user** what happened (MessageToast on success, MessageBox on failure).
5. **Confirm** destructive operations.

## Common mistakes here

- **M09** - assuming the request is done when the code returns: everything after `create()` runs before the response arrives. Put follow-up logic in the `success` callback.
- **M08** - create "succeeds" but the list doesn't show the row: the binding was not refreshed.
- **M06** - dialog inputs are null: fragment loaded without the view's id prefix.

## Try this

- Add an "Update" action: open the dialog with the selected request and use `oModel.update(sPath, payload)`.
- Disable the submit button while the create request is in flight (busy indicator on the dialog).
- Make the mock reject requests with `Days > 30` (edit `util/mockserver.ts` with a custom request handler) and handle the error response.
