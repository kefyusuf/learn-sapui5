/* Page object for the customer form - actions and assertions live here,
   the journey reads like the user story. */
sap.ui.define(["sap/ui/test/Opa5", "sap/ui/test/actions/EnterText"], function (Opa5, EnterText) {
	"use strict";

	return Opa5.extend("learn.databinding.test.integration.pages.AppPage", {

		iStartTheApp: function () {
			return this.iStartMyUIComponent({
				componentConfig: {
					name: "learn.databinding",
					async: true
				}
			});
		},

		iTeardown: function () {
			return this.iTeardownMyUIComponent();
		},

		iEnterName: function (sName) {
			return this.waitFor({
				viewName: "App",
				id: "nameInput",
				actions: new EnterText({ text: sName }),
				errorMessage: "Did not find the name input"
			});
		},

		iEnterEmail: function (sEmail) {
			return this.waitFor({
				viewName: "App",
				id: "emailInput",
				actions: new EnterText({ text: sEmail }),
				errorMessage: "Did not find the email input"
			});
		},

		theSummaryShows: function (sText) {
			return this.waitFor({
				viewName: "App",
				id: "summaryText",
				success: function (oText) {
					Opa5.assert.ok(oText.getText().indexOf(sText) > -1,
						`summary contains "${sText}" (got: "${oText.getText()}")`);
				},
				errorMessage: `Summary never contained "${sText}"`
			});
		},

		theSaveButtonIsEnabled: function (bEnabled) {
			return this.waitFor({
				viewName: "App",
				id: "saveButton",
				success: function (oButton) {
					Opa5.assert.strictEqual(oButton.getEnabled(), bEnabled,
						`save button enabled is ${bEnabled}`);
				},
				errorMessage: "Did not find the save button"
			});
		}
	});
});
