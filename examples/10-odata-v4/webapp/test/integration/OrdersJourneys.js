/* Integration journeys for example 10 (OData V4): selection/$expand,
 * create and delete flows.
 *
 * ONE file with ONE page object on purpose: each Opa5.extendConfig call
 * replaces the arrangements/actions/assertions set, so splitting the
 * journeys into separate modules would break each other's page objects
 * (docs/12). */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function (opaTest, Opa5, Press, EnterText, BindingPath, PropertyStrictEquals) {
	"use strict";

	const OrdersPage = Opa5.extend("learn.odatav4.test.integration.pages.OrdersPage", {

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

		/* selection + $expand */

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
		},

		/* create flow */

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

		/* delete flow */

		iPressTheDeleteButton: function () {
			return this.waitFor({
				viewName: "App",
				id: "deleteOrderButton",
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

		theOrderDisappears: function (sOrderId) {
			return this.waitFor({
				viewName: "App",
				id: "ordersTable",
				check: function (oTable) {
					return !oTable.getItems().some((oItem) =>
						oItem.getCells()[0].getText() === sOrderId);
				},
				success: function () {
					Opa5.assert.ok(true, `order "${sOrderId}" removed from the list`);
				},
				errorMessage: `Order "${sOrderId}" is still in the list after deletion`
			});
		}
	});

	Opa5.extendConfig({
		arrangements: new OrdersPage(),
		actions: new OrdersPage(),
		assertions: new OrdersPage(),
		viewNamespace: "learn.odatav4.view.",
		timeout: 20
	});

	opaTest("selecting an order loads its items via $expand", function (Given, When, Then) {
		Given.iStartTheApp()
			.and.iSelectTheOrder("SO-2002");

		Then.theItemsTableShows('27" 4K Monitor')
			.and.iTeardown();
	});

	opaTest("selecting another order swaps the items", function (Given, When, Then) {
		Given.iStartTheApp()
			.and.iSelectTheOrder("SO-2001");

		Then.theItemsTableShows("Laser Mouse Pro")
			.and.theItemsTableShows("Ergo Keyboard XL")
			.and.iTeardown();
	});

	opaTest("creates a sales order through the dialog (V4 transient row)", function (Given, When, Then) {
		Given.iStartTheApp()
			.and.iPressTheAddButton();

		When.iEnterOrderId("SO-2999")
			.and.iEnterCustomer("OPA Industries")
			.and.iPressCreate();

		Then.theCatalogShowsOrder("SO-2999")
			.and.iTeardown();
	});

	opaTest("deletes a childless order after confirmation", function (Given, When, Then) {
		Given.iStartTheApp()
			.and.iSelectTheOrder("SO-2004")
			.and.iPressTheDeleteButton();

		Then.theConfirmDialogAppears();

		When.iConfirmTheDeletion();

		Then.theOrderDisappears("SO-2004")
			.and.iTeardown();
	});
});
