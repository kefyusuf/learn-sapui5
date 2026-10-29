# 07 - TypeScript in UI5

Every example in this repo is TypeScript. Here is how the setup works and where the traps are. Verified against SAPUI5 1.152 with `@sapui5/types`.

## How it runs (no manual build)

Sources stay ESM-style TypeScript. The `ui5-tooling-transpile` middleware/task converts them to `sap.ui.define` AMD modules **on request** (serve) or **at build**:

```ts
// what you write (webapp/controller/App.controller.ts)
import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";

export default class AppController extends Controller { ... }
```

```js
// what the browser receives (/controller/App.controller.js)
sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageToast"], function (Controller, MessageToast) { ... });
```

XML views reference controllers by name (`learn.databinding.controller.App`) - the module system maps that to the transpiled file. You never edit the generated JS.

## The three config files

**package.json** - the toolchain only:

```json
"devDependencies": {
    "@sapui5/types": "1.152.0",
    "@ui5/cli": "4.0.65",
    "typescript": "6.0.3",
    "ui5-tooling-transpile": "3.13.1"
}
```

**ui5.yaml** - wires the transpiler into serve and build:

```yaml
builder:
  customTasks:
    - name: ui5-tooling-transpile-task
      afterTask: replaceVersion
server:
  customMiddleware:
    - name: ui5-tooling-transpile-middleware
      afterMiddleware: compression
```

**tsconfig.json** - the part with the trap:

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "strictPropertyInitialization": false,
    "rootDir": "./webapp",
    "paths": {
      "learn/databinding/*": ["./webapp/*"]
    },
    "types": ["@sapui5/types"]
  },
  "include": ["./webapp/**/*"]
}
```

- `types: ["@sapui5/types"]` - full UI5 API typings (controls, models, sap.fe).
- `paths` - makes imports of **your own** modules resolvable. Use **slashes**, not the dotted namespace: `"learn/databinding/*"` for `import X from "learn/databinding/model/formatter"`. With the dotted form (`"learn.databinding/*"`) the compiler cannot find your own files (M11) - the classic "Cannot find module" on your own code.
- `strictPropertyInitialization: false` - UI5 controls initialize properties in metadata, not in field initializers.

## Typing conventions used in this repo

```ts
// byId returns a base element - cast to the concrete control
const oInput = this.byId("nameInput") as Input;

// event parameters are accessed loosely - type the shape you use
public onSearch(oEvent: { getSource(): unknown }): void {
    const sQuery = (oEvent.getSource() as SearchField).getValue();
}

// formatter adapters keep XML bindings simple
public formatPhone(sPhone: string): string {
    return formatter.formatPhone(sPhone);
}
```

## What TypeScript buys you in UI5

- Completion for every UI5 class and property (`@sapui5/types` covers sap.m, sap.ui.core, sap.fe, ...).
- Compile-time errors for typos in class names and imports - before the browser shows a blank screen.
- Refactoring safety across controllers.

`npm run ts-typecheck` (`tsc --noEmit`) checks every example in this repo without serving anything.
