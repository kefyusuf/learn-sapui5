/* Page object for the leave-request list - the create-request dialog flow. */
sap.ui.define(["sap/ui/test/Opa5", "sap/ui/test/actions/Press", "sap/ui/test/actions/EnterText"],
	function (Opa5, Press, EnterText) {
	"use strict";

	return Opa5.extend("learn.crud.test.integration.pages.LeaveRequestPage", {

		iStartTheApp: function () {
			return this.iStartMyUIComponent({
				componentConfig: {
					name: "learn.crud",
					async: true
				}
			});
		},

		iTeardown: function () {
			return this.iTeardownMyUIComponent();
		},

		iPressTheNewRequestButton: function () {
			return this.waitFor({
				viewName: "App",
				id: "newRequestButton",
				actions: new Press(),
				errorMessage: "Did not find the new-request button"
			});
		},

		iEnterEmployee: function (sName) {
			return this.waitFor({
				viewName: "App",
				id: "employeeInput",
				actions: new EnterText({ text: sName }),
				errorMessage: "Did not find the employee input (is the dialog open?)"
			});
		},

		iPickStartDate: function (sStart) {
			// DatePickers wrap an inner input - EnterText targets it with idSuffix
			return this.waitFor({
				viewName: "App",
				id: "startPicker",
				actions: new EnterText({ text: sStart, idSuffix: "inner" }),
				errorMessage: "Did not find the start date picker"
			});
		},

		iPickEndDate: function (sEnd) {
			return this.waitFor({
				viewName: "App",
				id: "endPicker",
				actions: new EnterText({ text: sEnd, idSuffix: "inner" }),
				errorMessage: "Did not find the end date picker"
			});
		},

		iSubmitTheRequest: function () {
			return this.waitFor({
				viewName: "App",
				id: "dialogSubmit",
				actions: new Press(),
				errorMessage: "Did not find the dialog submit button"
			});
		},

		theDialogIsOpen: function (bOpen) {
			return this.waitFor({
				viewName: "App",
				id: "newRequestDialog",
				// a CLOSED dialog has no DOM - visibility checks would never run
				visible: false,
				// poll: the submit round trip closes the dialog async
				check: function (oDialog) {
					return oDialog.isOpen() === bOpen;
				},
				success: function (oDialog) {
					Opa5.assert.strictEqual(oDialog.isOpen(), bOpen,
						`dialog open is ${bOpen}`);
				},
				errorMessage: `Dialog never reached open=${bOpen}`
			});
		},

		theListShowsRequestFor: function (sEmployee) {
			return this.waitFor({
				viewName: "App",
				id: "requestsTable",
				// check keeps polling until the refreshed binding shows the row
				check: function (oTable) {
					return oTable.getItems().some((oItem) =>
						oItem.getCells()[1].getText() === sEmployee);
				},
				success: function () {
					Opa5.assert.ok(true, `list shows a request for "${sEmployee}"`);
				},
				errorMessage: `The list never showed a request for "${sEmployee}" after refresh`
			});
		}
	});
});
