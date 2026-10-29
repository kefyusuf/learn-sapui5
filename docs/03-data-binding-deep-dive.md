# 03 - Data Binding Deep Dive

Data binding is the heart of UI5: controls display model data and write user input back. See it live in [example 03](../examples/03-data-binding-forms/README.md).

## The four binding forms you will use daily

```xml
<!-- 1. Simple (two-way by default) -->
<Input value="{/customer/name}" />

<!-- 2. With path + formatter (model → UI, formatted) -->
<Text text="{path: '/customer/phone', formatter: '.formatPhone'}" />

<!-- 3. Expression binding - mini JavaScript, model → UI -->
<Button enabled="{= ${/customer/name} !== '' && ${/customer/email}.indexOf('@') > 0 }" />

<!-- 4. Multi-part binding - several model values feed one function -->
<Text text="{
    parts: [ { path: '/customer/name' }, { path: '/customer/email' } ],
    formatter: '.formatSummary'
}" />
```

Direction rules:

- `value` of inputs is **two-way**: typing updates the model (and with `valueLiveUpdate="true"`, on every keystroke).
- `text` of display controls is **one-way**: model → UI.
- Formatters and expression bindings never write to the model.

## Formatters: pure functions in a module

`webapp/model/formatter.ts` holds static functions - no state, no model access, easy to unit test. XML views reach them through thin controller adapters: a leading `.` in `formatter: '.formatPhone'` resolves to a method **on the view's controller**, which delegates to the module. (Referencing a module path directly inside a binding string is only possible via `core:require` - possible but easy to get wrong, so this repo standardizes on the dot notation.)

## Named models

```ts
// in a controller
this.getView()?.setModel(new JSONModel(oData));          // default model: {/path}
this.getView()?.setModel(new JSONModel(oState), "ui");   // named: {ui>/path}
```

Best practice: **backend data lives in the OData model; UI state (selected item, flags, dialog mode) in a small JSON model**. Mixing both makes state impossible to reason about.

## Data types: parse and format input

```xml
<Input value="{path: '/customer/revenue', type: 'sap.ui.model.type.Float'}" />
<DatePicker value="{path: '/order/date', type: 'sap.ui.model.type.Date'}" />
```

Types convert the model value to an editable representation and back, and raise validation messages the framework routes to the message manager.

## The async trap (M03)

```ts
public onInit(): void {
    this.getView()?.setModel(new JSONModel(oData));
    // WRONG: bindings update asynchronously - this is often still undefined
    const s = this.getView()?.getModel()?.getProperty("/customer/name");
}
```

Do not read model data right after binding it. React to events (`attachPatternMatched`, `selectionChange`, `liveChange`) or let bindings/formatters do the work.

## Common mistakes

- M03 - reading bound data too early. [docs/09](09-common-mistakes.md)
- M05 - formatter as instance method loses `this`; keep formatters pure/module-level.
- M11 - importing your own module with dots (`learn.databinding.model`) instead of slashes (`learn/databinding/model`).
