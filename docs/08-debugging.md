# 08 - Debugging

You will spend more time debugging than writing code. These are the tools, ordered by how often you will use them.

## 1. The browser console (F12)

Every UI5 log line - warnings, errors, deprecations - appears in the console with the module that produced it. **Read the FIRST error, not the last**: a boot failure cascades into dozens of follow-up errors. The error message usually names the missing/failed resource:

```
failed to load 'learn/helloworld/controller/App.controller.js' ...
```

→ typo in the namespace or file name (M02).

## 2. The network tab

For any OData problem, the network tab shows the truth:

- `$metadata` → 404? Wrong uri, proxy not mounted, backend down (M12).
- `GET Products?$...` → 200 but empty? Your filter/expand is wrong (M07).
- Requests never sent? The model was not created - check the manifest.

Example 06/07's mock server answers *in the browser* - mock requests appear there too (their responses come from the MockServer, not the network). Example 08's proxy requests hit the real network - compare the URL with what you expected.

## 3. The UI5 Diagnostics window

Press **Ctrl+Alt+Shift+P** (or Ctrl+Alt+Shift+S in older versions) on any running UI5 app:

- **Control Inspector**: click any control on screen, see its id, bindings and binding contexts.
- **Binding info**: for a selected control, see every binding, its path, model and *why a value is missing*.
- **Breakpoints on bindings**: pause execution when a binding updates - the fastest way into framework code.

## 4. Breakpoints in sources

DevTools → Sources → find your file under the page origin. Your transpiled TS maps cleanly (the transpiler keeps names). Useful spots:

- your controller methods (does the handler even fire? - M05),
- `sap/ui/model/Binding.js` (why is a binding not updating?).

## 5. Log listener from code

When headless or automated testing hides the console (this repo's verification used exactly this), capture UI5 logs into the page:

```js
sap.ui.require(["sap/base/Log"], function (Log) {
    Log.addLogListener({
        onLogEntry: function (oEntry) {
            if (oEntry.level <= sap.base.Log.Level.ERROR) {
                document.title = String(oEntry.message) + " " + String(oEntry.details);
            }
        }
    });
});
```

## 6. Strategy: read the error, form a hypothesis, change ONE thing

The mistakes catalog in [09-common-mistakes.md](09-common-mistakes.md) maps real error messages to causes - scan it before you start guessing. Then change one thing at a time and reload; UI5's dev server makes the loop fast (no build).
