/* Smoke journey for example 01: the app boots, the controls are there
   and the greeting flow works end to end. */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"learn/helloworld/test/integration/pages/AppPage"
], function (opaTest, Opa5, AppPage) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new AppPage(),
		actions: new AppPage(),
		assertions: new AppPage(),
		viewNamespace: "learn.helloworld.view.",
		timeout: 20
	});

	opaTest("boots and renders the greeting screen", function (Given, When, Then) {
		Given.iStartTheApp();

		Then.theAppRenders()
			.and.iTeardown();
	});

	opaTest("greets the user after pressing the button", function (Given, When, Then) {
		Given.iStartTheApp();

		When.iEnterName("OPA")
			.and.iPressSayHello();

		// The toast is transient - its presence proves the full flow ran.
		Then.theGreetingToastAppears()
			.and.iTeardown();
	});
});
