/* Integration journey for example 03: drives the REAL app - real
   component, real bindings, real user interactions via OPA5. */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"learn/databinding/test/integration/pages/AppPage"
], function (opaTest, Opa5, AppPage) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new AppPage(),
		actions: new AppPage(),
		assertions: new AppPage(),
		viewNamespace: "learn.databinding.view.",
		timeout: 20
	});

	opaTest("the summary bar mirrors the typed name", function (Given, When, Then) {
		Given.iStartTheApp()
			.and.iEnterName("Ali Veli");

		Then.theSummaryShows("Ali Veli")
			.and.iTeardown();
	});

	opaTest("the save button enables only with a valid email", function (Given, When, Then) {
		Given.iStartTheApp();

		Then.theSaveButtonIsEnabled(false);

		When.iEnterName("Ali Veli")
			.and.iEnterEmail("ali.veli@acme-corp.com");

		Then.theSaveButtonIsEnabled(true)
			.and.iTeardown();
	});
});
