/* Integration journey for example 05: master -> detail navigation.
   The router does the work; the journey only clicks and verifies. */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"learn/routing/test/integration/pages/MasterDetailPage"
], function (opaTest, Opa5, MasterDetailPage) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new MasterDetailPage(),
		actions: new MasterDetailPage(),
		assertions: new MasterDetailPage(),
		viewNamespace: "learn.routing.view.",
		timeout: 20
	});

	opaTest("navigates from the order list to the detail page", function (Given, When, Then) {
		Given.iStartTheApp()
			.and.iPressOnOrder("SO-1002");

		Then.theDetailShowsOrder("SO-1002", "Borealis Retail Group")
			.and.iTeardown();
	});

	opaTest("navigates to a different order from the same list", function (Given, When, Then) {
		Given.iStartTheApp()
			.and.iPressOnOrder("SO-1003");

		Then.theDetailShowsOrder("SO-1003", "Delta Logistics")
			.and.iTeardown();
	});
});
