/* Integration journey for example 10: select an order in the V4 table
   and verify the $expand-ed items land in the detail table. */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"learn/odatav4/test/integration/pages/OrdersPage"
], function (opaTest, Opa5, OrdersPage) {
	"use strict";

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
});
