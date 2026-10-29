/* Page object for example 01 - the boot smoke flow. */
sap.ui.define(["sap/ui/test/Opa5", "sap/ui/test/actions/Press", "sap/ui/test/actions/EnterText"],
	function (Opa5, Press, EnterText) {
	"use strict";

	return Opa5.extend("learn.helloworld.test.integration.pages.AppPage", {

		iStartTheApp: function () {
			return this.iStartMyUIComponent({
				componentConfig: {
					name: "learn.helloworld",
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

		iPressSayHello: function () {
			return this.waitFor({
				viewName: "App",
				controlType: "sap.m.Button",
				actions: new Press(),
				errorMessage: "Did not find the say-hello button"
			});
		},

		theAppRenders: function () {
			return this.waitFor({
				viewName: "App",
				id: "nameInput",
				success: function () {
					Opa5.assert.ok(true, "the app rendered with its input");
				},
				errorMessage: "The app did not render the name input"
			});
		},

		theGreetingToastAppears: function () {
			// Toasts are transient DOM elements outside the view - poll
			// the rendered page for the toast class.
			return this.waitFor({
				check: function () {
					return Boolean(document.querySelector(".sapMMessageToast"));
				},
				success: function () {
					Opa5.assert.ok(true, "the greeting toast appeared");
				},
				errorMessage: "The greeting toast never appeared"
			});
		}
	});
});
