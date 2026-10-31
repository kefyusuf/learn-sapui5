/* Page object for the OData V4 sales orders app. */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/BindingPath"
], function (Opa5, Press, BindingPath) {
	"use strict";

	return Opa5.extend("learn.odatav4.test.integration.pages.OrdersPage", {

		iStartTheApp: function () {
			return this.iStartMyUIComponent({
				componentConfig: {
					name: "learn.odatav4",
					async: true
				}
			});
		},

		iTeardown: function () {
			return this.iTeardownMyUIComponent();
		},

		iSelectTheOrder: function (sOrderId) {
			return this.waitFor({
				viewName: "App",
				controlType: "sap.m.ColumnListItem",
				matchers: new BindingPath({ path: `/SalesOrders('${sOrderId}')` }),
				actions: new Press(),
				errorMessage: `Did not find order "${sOrderId}" in the orders table`
			});
		},

		theItemsTableShows: function (sProduct) {
			return this.waitFor({
				viewName: "App",
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
});
