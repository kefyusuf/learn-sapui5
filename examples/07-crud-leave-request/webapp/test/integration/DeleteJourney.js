/* Integration journey for example 07: the DELETE flow against the real
 * dialog + mocked OData service.
 *
 * MessageBox handling lesson: OPA cannot click native browser dialogs,
 * but sap.m.MessageBox renders REAL controls - reach them with
 * searchOpenDialogs: true (docs/12). */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function (opaTest, Opa5, Press, BindingPath, PropertyStrictEquals) {
	"use strict";

	const LeaveRequestPage = Opa5.extend("learn.crud.test.integration.pages.DeletePage", {

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

		iSelectTheRequest: function (sId) {
			return this.waitFor({
				viewName: "App",
				controlType: "sap.m.ColumnListItem",
				matchers: new BindingPath({ path: `/LeaveRequestSet('${sId}')` }),
				actions: new Press(),
				errorMessage: `Did not find request "${sId}" in the list`
			});
		},

		iPressTheDeleteButton: function () {
			return this.waitFor({
				viewName: "App",
				id: "deleteRequestButton",
				actions: new Press(),
				errorMessage: "Did not find the delete button"
			});
		},

		theConfirmDialogAppears: function () {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({ name: "text", value: "OK" }),
				success: function () {
					Opa5.assert.ok(true, "the confirmation dialog is open");
				},
				errorMessage: "The MessageBox confirmation never appeared",
				timeout: 20
			});
		},

		iConfirmTheDeletion: function () {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({ name: "text", value: "OK" }),
				actions: new Press(),
				errorMessage: "Did not find the OK button in the confirmation"
			});
		},

		theRequestDisappears: function (sId) {
			return this.waitFor({
				viewName: "App",
				id: "requestsTable",
				// poll: the remove + binding refresh are async
				check: function (oTable) {
					return !oTable.getItems().some((oItem) =>
						oItem.getCells()[0].getText() === sId);
				},
				success: function () {
					Opa5.assert.ok(true, `request "${sId}" removed from the list`);
				},
				errorMessage: `Request "${sId}" is still in the list after deletion`
			});
		}
	});

	Opa5.extendConfig({
		arrangements: new LeaveRequestPage(),
		actions: new LeaveRequestPage(),
		assertions: new LeaveRequestPage(),
		viewNamespace: "learn.crud.view.",
		timeout: 20
	});

	opaTest("deletes the selected request after confirmation", function (Given, When, Then) {
		Given.iStartTheApp()
			.and.iSelectTheRequest("LR-0001")
			.and.iPressTheDeleteButton();

		Then.theConfirmDialogAppears();

		When.iConfirmTheDeletion();

		Then.theRequestDisappears("LR-0001")
			.and.iTeardown();
	});
});
