/* Page object for the OData V4 sales orders app. */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/matchers/BindingPath"
], function (Opa5, Press, EnterText, BindingPath) {
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

		iPressTheAddButton: function () {
			return this.waitFor({
				viewName: "App",
				id: "addOrderButton",
				actions: new Press(),
				errorMessage: "Did not find the add-order button"
			});
		},

		iEnterOrderId: function (sId) {
			return this.waitFor({
				viewName: "App",
				id: "idInput",
				actions: new EnterText({ text: sId }),
				errorMessage: "Did not find the order-id input (is the dialog open?)"
			});
		},

		iEnterCustomer: function (sCustomer) {
			return this.waitFor({
				viewName: "App",
				id: "customerInput",
				actions: new EnterText({ text: sCustomer }),
				errorMessage: "Did not find the customer input"
			});
		},

		iPressCreate: function () {
			return this.waitFor({
				viewName: "App",
				id: "dialogCreate",
				actions: new Press(),
				errorMessage: "Did not find the dialog create button"
			});
		},

		theCatalogShowsOrder: function (sOrderId) {
			return this.waitFor({
				viewName: "App",
				id: "ordersTable",
				// poll: the transient row becomes persistent after the batch
				check: function (oTable) {
					return oTable.getItems().some((oItem) =>
						oItem.getCells()[0].getText() === sOrderId);
				},
				success: function () {
					Opa5.assert.ok(true, `table shows the created order "${sOrderId}"`);
				},
				errorMessage: `The table never showed the created order "${sOrderId}"`
			});
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
