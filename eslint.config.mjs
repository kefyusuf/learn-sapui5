// Flat config (ESLint 10). Scope: the TypeScript application sources, the
// QUnit/OPA5 test modules (plain JS, AMD via sap.ui.define) and the tooling
// scripts. UI5-specific rules stay with ui5lint (`npm run lint` runs both).
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
	{
		ignores: ["**/node_modules/**", "**/dist/**", "**/resources/**"]
	},

	js.configs.recommended,
	...tseslint.configs.recommended,

	{
		// Application + test code runs in the browser: `sap` comes from the
		// UI5 bootstrap, QUnit from the test page. no-undef stays active for
		// the plain-JS tests; for TS files typescript-eslint turns it off.
		files: ["examples/*/webapp/**/*.{ts,js}"],
		languageOptions: {
			globals: {
				...globals.browser,
				sap: "readonly",
				QUnit: "readonly"
			}
		},
		rules: {
			// console.error is part of the teaching story (ex 11 logs a load
			// failure on purpose - the headless runner surfaces it).
			"no-console": ["error", { allow: ["warn", "error"] }],
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					args: "after-used",
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_"
				}
			]
		}
	},

	{
		// The headless runner and the CDP probe are Node ESM tools - a
		// deliberate console.log summary is their whole output contract.
		files: ["scripts/**/*.mjs"],
		languageOptions: {
			globals: { ...globals.node }
		},
		rules: {
			"no-console": "off"
		}
	}
);
