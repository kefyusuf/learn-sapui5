/* Page object for the sales orders app - selection and $expand flow. */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/BindingPath"
], function (Opa5, Press, BindingPath) {
	"use strict";

	return Opa5.extend("learn.odata.test.integration.pages.OrdersPage", {

		iStartTheApp: function () {
			return this.iStartMyUIComponent({
				componentConfig: {
					name: "learn.odata",
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
				// NO id here: id + controlType form an AND pipeline - the id
				// matches the table while controlType wants its rows. Filter
				// by controlType + the row's binding context path instead.
				controlType: "sap.m.ColumnListItem",
				matchers: new BindingPath({ path: `/SalesOrderSet('${sOrderId}')` }),
				actions: new Press(),
				errorMessage: `Did not find order "${sOrderId}" in the orders table`
			});
		},

		theItemsTableShows: function (sProduct) {
			return this.waitFor({
				viewName: "App",
				id: "itemsTable",
				// poll: the selection triggers bindElement + an async
				// $expand request before the items table fills
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
