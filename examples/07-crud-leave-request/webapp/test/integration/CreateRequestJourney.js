/* Integration journey for example 07: create-request flow through the
   real dialog against the mocked OData service. */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"learn/crud/test/integration/pages/LeaveRequestPage"
], function (opaTest, Opa5, LeaveRequestPage) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new LeaveRequestPage(),
		actions: new LeaveRequestPage(),
		assertions: new LeaveRequestPage(),
		viewNamespace: "learn.crud.view.",
		timeout: 20
	});

	opaTest("creates a leave request through the dialog", function (Given, When, Then) {
		Given.iStartTheApp()
			.and.iPressTheNewRequestButton();

		Then.theDialogIsOpen(true);

		When.iEnterEmployee("OPA Tester")
			.and.iPickStartDate("2026-12-01")
			.and.iPickEndDate("2026-12-05")
			.and.iSubmitTheRequest();

		Then.theDialogIsOpen(false)
			.and.theListShowsRequestFor("OPA Tester")
			.and.iTeardown();
	});
});
