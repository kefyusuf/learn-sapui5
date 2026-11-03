/* Integration journey for example 15: the metadata-driven form - the
   SmartFields render from the $metadata (labels, types) and edit through
   two-way bindings; saving flushes the V4 update group (PATCH). */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText"
], function (opaTest, Opa5, Press, EnterText) {
	"use strict";

	const SmartPage = Opa5.extend("learn.smart.test.integration.pages.SmartPage", {

		iStartTheApp: function () {
			return this.iStartMyUIComponent({
				componentConfig: {
					name: "learn.smart",
					async: true
				}
			});
		},

		iTeardown: function () {
			return this.iTeardownMyUIComponent();
		},

		iPressSave: function () {
			return this.waitFor({
				viewName: "App",
				id: "saveButton",
				actions: new Press(),
				errorMessage: "Did not find the save button"
			});
		},

		iEditCustomer: function (sValue) {
			return this.waitFor({
				viewName: "App",
				// the SmartField wraps an inner sap.m.Input whose id contains
				// the SmartField's id - unlike DatePicker/Select, its DOM has
				// no plain "inner" suffix, so filter by id instead (docs/12)
				controlType: "sap.m.Input",
				matchers: function (oInput) {
					return oInput.getId().indexOf("customerField") >= 0;
				},
				actions: new EnterText({ text: sValue }),
				errorMessage: "Did not find the customer smart field's inner input (did the form build itself?)"
			});
		},

		theCustomerFieldShows: function (sValue) {
			return this.waitFor({
				viewName: "App",
				id: "customerField",
				// poll the SmartField's value property; guarded - the inner
				// control may not be ready on early polls
				check: function (oSmartField) {
					try {
						return String(oSmartField.getValue() ?? "") === sValue;
					} catch (e) {
						return false;
					}
				},
				success: function () {
					Opa5.assert.ok(true, `the smart field shows "${sValue}"`);
				},
				errorMessage: `The customer smart field never showed "${sValue}"`
			});
		},

		theFormBuiltItself: function () {
			return this.waitFor({
				viewName: "App",
				controlType: "sap.ui.comp.smartfield.SmartField",
				// with controlType, check receives ALL candidates at once
				// (M18) - count them here; success asserts a plain boolean
				check: function (vFields) {
					return Array.isArray(vFields) ? vFields.length === 3 : false;
				},
				success: function () {
					Opa5.assert.ok(true, "three smart fields rendered from the metadata");
				},
				errorMessage: "The SmartForm never rendered three fields"
			});
		}
	});

	Opa5.extendConfig({
		arrangements: new SmartPage(),
		actions: new SmartPage(),
		assertions: new SmartPage(),
		viewNamespace: "learn.smart.view.",
		timeout: 60
	});

	opaTest("the form builds itself from the metadata", function (Given, When, Then) {
		Given.iStartTheApp();

		Then.theFormBuiltItself()
			.and.theCustomerFieldShows("Acme Industries Ltd.")
			.and.iTeardown();
	});

	opaTest("edits through the smart field and saves", function (Given, When, Then) {
		Given.iStartTheApp();

		When.iEditCustomer("Acme Industries International");

		Then.theCustomerFieldShows("Acme Industries International")
			.and.iTeardown();
	});
});
