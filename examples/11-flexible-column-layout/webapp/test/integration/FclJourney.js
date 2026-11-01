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

		iPressTheFirstItem: function () {
			return this.waitFor({
				viewName: "Detail",
				controlType: "sap.m.ColumnListItem",
				// match by content, not by the (model-resolved) binding path.
				// A matcher FUNCTION here - with controlType, check receives
				// every candidate at once and getCells() blows up on it.
				matchers: function (oRow) {
					return oRow.getCells()[0].getText() === '27" 4K Monitor';
				},
				actions: new Press(),
				errorMessage: "Did not find the monitor row in the items table"
			});
		},

		theItemDetailShows: function (sProduct) {
			return this.waitFor({
				viewName: "ItemDetail",
				id: "itemObjectHeader",
				timeout: 90,
				success: function (oHeader) {
					Opa5.assert.strictEqual(oHeader.getTitle(), sProduct,
						`third column shows item ${sProduct}`);
				},
				errorMessage: "Did not reach the item detail (third column)"
			});
		},

		theLayoutIs: function (sLayout) {
			return this.waitFor({
				controlType: "sap.f.FlexibleColumnLayout",
				// a MATCHER (per control) - with controlType, check receives
				// every candidate at once and getLayout() blows up on it
				matchers: function (oFCL) {
					return oFCL.getLayout() === sLayout;
				},
				success: function () {
					Opa5.assert.ok(true, `layout is ${sLayout}`);
				},
				errorMessage: `The layout never became ${sLayout}`
			});
		},

		iCloseTheItemDetail: function () {
			return this.waitFor({
				viewName: "ItemDetail",
				id: "closeItemButton",
				actions: new Press(),
				errorMessage: "Did not find the close button in the item detail"
			});
		},

		iPressTheDeleteButton: function () {
			return this.waitFor({
				viewName: "ItemDetail",
				id: "deleteItemButton",
				actions: new Press(),
				errorMessage: "Did not find the delete button in the item detail"
			});
		},

		iConfirmTheDelete: function () {
			return this.waitFor({
				controlType: "sap.m.Button",
				// the MessageBox's OK button lives in the static UI area -
				// no viewName, filter per control by its text
				matchers: function (oButton) {
					return oButton.getText() === "OK";
				},
				actions: new Press(),
				errorMessage: "The delete confirmation (OK button) never appeared"
			});
		},

		theItemIsGone: function (sProduct) {
			return this.waitFor({
				viewName: "Detail",
				id: "itemsTable",
				// poll until the V4 list binding reflects the DELETE
				check: function (oTable) {
					return !oTable.getItems().some((oItem) =>
						oItem.getCells()[0].getText() === sProduct);
				},
				success: function () {
					Opa5.assert.ok(true, `item "${sProduct}" removed from the table`);
				},
				errorMessage: `The item "${sProduct}" is still in the items table`
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

	opaTest("opens the item detail in the third column and closes it", function (Given, When, Then) {
		Given.iStartTheApp()
			.and.iSelectTheOrder("SO-2002")
			.and.iPressTheFirstItem();

		Then.theItemDetailShows('27" 4K Monitor')
			.and.theLayoutIs("ThreeColumnsMidExpanded");

		When.iCloseTheItemDetail();

		Then.theLayoutIs("TwoColumnsMidExpanded")
			.and.iTeardown();
	});

	opaTest("deletes the item from the third column", function (Given, When, Then) {
		Given.iStartTheApp()
			.and.iSelectTheOrder("SO-2002")
			.and.iPressTheFirstItem();

		When.iPressTheDeleteButton()
			.and.iConfirmTheDelete();

		Then.theItemIsGone('27" 4K Monitor')
			.and.theLayoutIs("TwoColumnsMidExpanded")
			.and.iTeardown();
	});
});
