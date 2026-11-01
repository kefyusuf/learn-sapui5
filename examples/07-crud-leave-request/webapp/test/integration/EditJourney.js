/* Integration journey for example 07: the UPDATE flow - edit the leave
 * type of the selected request through the real dialog. */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/BindingPath"
], function (opaTest, Opa5, Press, BindingPath) {
	"use strict";

	const EditPage = Opa5.extend("learn.crud.test.integration.pages.EditPage", {

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

		iPressTheEditButton: function () {
			return this.waitFor({
				viewName: "App",
				id: "editRequestButton",
				actions: new Press(),
				errorMessage: "Did not find the edit button"
			});
		},

		iChooseType: function (sType) {
			return this.waitFor({
				viewName: "App",
				id: "editStatusSelect",
				success: function (oSelect) {
					// setSelectedKey is the pragmatic OPA action for
					// sap.m.Select (fires change, updates the model).
					oSelect.setSelectedKey(sType);
				},
				errorMessage: "Did not find the type select (is the dialog open?)"
			});
		},

		iSaveTheEdit: function () {
			return this.waitFor({
				viewName: "App",
				id: "editSave",
				actions: new Press(),
				errorMessage: "Did not find the edit save button"
			});
		},

		theRowShowsType: function (sId, sType) {
			return this.waitFor({
				viewName: "App",
				id: "requestsTable",
				check: function (oTable) {
					return oTable.getItems().some((oItem) =>
						oItem.getCells()[0].getText() === sId &&
						oItem.getCells()[2].getText() === sType);
				},
				success: function () {
					Opa5.assert.ok(true, `request "${sId}" shows type "${sType}"`);
				},
				errorMessage: `Request "${sId}" never showed type "${sType}"`
			});
		}
	});

	Opa5.extendConfig({
		arrangements: new EditPage(),
		actions: new EditPage(),
		assertions: new EditPage(),
		viewNamespace: "learn.crud.view.",
		timeout: 20
	});

	opaTest("edits the leave type of the selected request", function (Given, When, Then) {
		Given.iStartTheApp()
			.and.iSelectTheRequest("LR-0003")
			.and.iPressTheEditButton();

		When.iChooseType("Annual")
			.and.iSaveTheEdit();

		Then.theRowShowsType("LR-0003", "Annual")
			.and.iTeardown();
	});
});
