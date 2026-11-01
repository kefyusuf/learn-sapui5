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
});
