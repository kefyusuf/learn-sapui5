/* Integration journey for example 11: the FCL master-detail flow -
   boot in OneColumn, select an order, verify the MID column (Detail)
   shows the $expand-ed items in TwoColumnsMidExpanded. */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/BindingPath"
], function (opaTest, Opa5, Press, BindingPath) {
	"use strict";

	const FclPage = Opa5.extend("learn.fcl.test.integration.pages.FclPage", {

		iStartTheApp: function () {
			return this.iStartMyUIComponent({
				componentConfig: {
					name: "learn.fcl",
					async: true
				}
			});
		},

		iTeardown: function () {
			return this.iTeardownMyUIComponent();
		},

		iSelectTheOrder: function (sOrderId) {
			return this.waitFor({
				viewName: "Master",
				controlType: "sap.m.ColumnListItem",
				matchers: new BindingPath({ path: `/SalesOrders('${sOrderId}')` }),
				actions: new Press(),
				errorMessage: `Did not find order "${sOrderId}" in the master list`
			});
		},

		theDetailShowsOrder: function (sOrderId) {
			return this.waitFor({
				viewName: "Detail",
				id: "objectHeader",
				// generous: the FCL boot + the V4 round-trips can be slow
				// when the machine is under load
				timeout: 90,
				success: function (oHeader) {
					Opa5.assert.strictEqual(oHeader.getTitle(), sOrderId,
						`detail column shows order ${sOrderId}`);
				},
				errorMessage: "Did not reach the detail column"
			});
		},

		theItemsTableShows: function (sProduct) {
			return this.waitFor({
				viewName: "Detail",
				id: "itemsTable",
				check: function (oTable) {
					return oTable.getItems().some((oItem) =>
						oItem.getCells()[0].getText() === sProduct);
				},
				success: function () {
					Opa5.assert.ok(true, `items table shows "${sProduct}"`);
				},
				errorMessage: `The items table never showed "${sProduct}"`
			});
		},

		iPressTheEditStatusButton: function () {
			return this.waitFor({
				viewName: "Detail",
				id: "editStatusButton",
				actions: new Press(),
				errorMessage: "Did not find the edit-status button"
			});
		},

		iChooseStatus: function (sStatus) {
			return this.waitFor({
				viewName: "Detail",
				id: "editStatusSelect",
				success: function (oSelect) {
					// setSelectedKey is the pragmatic OPA action for
					// sap.m.Select (fires change, updates the model).
					oSelect.setSelectedKey(sStatus);
				},
				errorMessage: "Did not find the status select (is the dialog open?)"
			});
		},

		iSaveTheEdit: function () {
			return this.waitFor({
				viewName: "Detail",
				id: "editSave",
				actions: new Press(),
				errorMessage: "Did not find the edit save button"
			});
		},

		theDetailStatusIs: function (sStatus) {
			return this.waitFor({
				viewName: "Detail",
				id: "objectHeader",
				// poll: the PATCH round-trips before the status updates
				check: function (oHeader) {
					return oHeader.getAttributes()[1].getText() === sStatus;
				},
				success: function () {
					Opa5.assert.ok(true, `detail shows status "${sStatus}"`);
				},
				errorMessage: `The detail never showed status "${sStatus}"`
			});
		}
	});

	Opa5.extendConfig({
		arrangements: new FclPage(),
		actions: new FclPage(),
		assertions: new FclPage(),
		viewNamespace: "learn.fcl.view.",
		// The FCL app pulls sap.f + the V4 model - the boot takes longer
		// than the default 20s in headless runs.
		timeout: 60
	});

	opaTest("selecting an order opens the detail column", function (Given, When, Then) {
		Given.iStartTheApp()
			.and.iSelectTheOrder("SO-2002");

		Then.theDetailShowsOrder("SO-2002")
			.and.theItemsTableShows('27" 4K Monitor')
			.and.iTeardown();
	});

	opaTest("updates the status of the selected order", function (Given, When, Then) {
		Given.iStartTheApp()
			.and.iSelectTheOrder("SO-2002")
			.and.iPressTheEditStatusButton();

		When.iChooseStatus("Open")
			.and.iSaveTheEdit();

		Then.theDetailStatusIs("Open")
			.and.iTeardown();
	});
});
