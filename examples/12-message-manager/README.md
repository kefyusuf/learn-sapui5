# Example 12 - MessageManager

**Real-life scenario:** The intake form that talks back: the user types a non-number into a decimal field, the backend type system says no, and the app shows it properly — count badge, MessagePopover, and a save that refuses to submit garbage. Every production form does this; most beginner forms don't.

## What you'll learn

- `handleValidation: true` (manifest): parse/validate exceptions from two-way bindings are routed into the **MessageManager** instead of throwing
- **`sap.ui.core.Messaging`** — the current facade (`Core.getMessageManager()` hands back the Messaging facade in 1.152, and it has **no** `attachMessageChange`; bind to the message model instead)
- The **MessagePopover** fed by the message model, with a count badge on the bell button
- The **transient create pattern**: `ODataListBinding.create()` → a form two-way bound to the new context → `submitBatch` turns it into a POST
- OPA5 lessons: `MessageBox.error` renders a **"Close"** button (not OK) in this version, modal dialogs **block** presses behind them, and a closed dialog is unrendered — you need `visible: false` to assert it closed

## Run it

```bash
npm run start:12   # from the repository root
```

## The flow

1. The orders table loads from the V4 mock (same service as examples 10/11).
2. **New order** creates a *transient* context (`ODataListBinding.create()`) and opens a dialog whose inputs are two-way bound to it — `{Customer}`, `{Total}`.
3. `Total` is `Edm.Decimal`. Type `abc`: the parse exception (`Enter a number`) lands in the MessageManager; the bell shows **1**.
4. **Save** refuses while messages exist (the "fix the highlighted fields" MessageBox). The message stays until the value parses again.
5. Fix the value (or cancel — messages linger), **Save** → `submitBatch` POSTs the transient context → the row appears without any manual refresh.

## Common mistakes here

- **`attachMessageChange` is gone**: `Core.getMessageManager()` returns the `Messaging` facade; observe the message model (a formatter binding on `message>/`) instead of attaching events.
- **`{message>/}` binding**: the MessagePopover's items bind the message model — set it on the view (`setModel(Messaging.getMessageModel(), "message")`).
- **Blocking popups in OPA**: while a modal dialog is open, OPA refuses to press controls behind it ("hidden behind a blocking popup"). Design journeys around the top layer: press the dialog's own buttons or close it first.
- **A closed dialog is unrendered**: asserting "the dialog closed" needs `visible: false` in the `waitFor`.
- **M16** applies: both fragments load with `controller: this` — without it, every press handler is dead.

## Try this

- Add a second bad field (Customer with a max length constraint in the metadata) and watch two messages appear.
- Clear all messages when the dialog closes with Cancel (`Messaging.removeMessages`) — and decide whether that is the right UX (messages that vanish can hide real problems).

## Tests

Two OPA5 journeys (headless-verified): validation message → bell count → MessagePopover, and the blocked save → fix → create → the row lands in the table.
