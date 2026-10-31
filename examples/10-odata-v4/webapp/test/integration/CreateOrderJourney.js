/* Integration journey for example 10: the V4 CREATE flow.
 *
 * ODataListBinding.create inserts a TRANSIENT row immediately; the batch
 * submit persists it - the row is expected to appear WITHOUT any manual
 * refresh (a V4 behavior that differs from V2). */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"learn/odatav4/test/integration/pages/OrdersPage"
], function (opaTest, Opa5, Press, EnterText, OrdersPage) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new OrdersPage(),
		actions: new OrdersPage(),
		assertions: new OrdersPage(),
		viewNamespace: "learn.odatav4.view.",
		timeout: 20
	});

	opaTest("creates a sales order through the dialog (V4 transient row)", function (Given, When, Then) {
		Given.iStartTheApp()
			.and.iPressTheAddButton();

		When.iEnterOrderId("SO-2004")
			.and.iEnterCustomer("OPA Industries")
			.and.iPressCreate();

		Then.theCatalogShowsOrder("SO-2004")
			.and.iTeardown();
	});
});
