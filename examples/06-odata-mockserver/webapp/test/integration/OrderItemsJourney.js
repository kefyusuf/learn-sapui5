/* Integration journey for example 06: select an order in the OData
   table and verify the $expand-ed items land in the detail table. */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"learn/odata/test/integration/pages/OrdersPage"
], function (opaTest, Opa5, OrdersPage) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new OrdersPage(),
		actions: new OrdersPage(),
		assertions: new OrdersPage(),
		viewNamespace: "learn.odata.view.",
		timeout: 20
	});

	opaTest("selecting an order loads its items via $expand", function (Given, When, Then) {
		Given.iStartTheApp()
			.and.iSelectTheOrder("SO-1002");

		Then.theItemsTableShows('27" 4K Monitor')
			.and.iTeardown();
	});

	opaTest("selecting another order swaps the items", function (Given, When, Then) {
		Given.iStartTheApp()
			.and.iSelectTheOrder("SO-1001");

		Then.theItemsTableShows("Laser Mouse Pro")
			.and.theItemsTableShows("External SSD 1TB")
			.and.iTeardown();
	});
});
