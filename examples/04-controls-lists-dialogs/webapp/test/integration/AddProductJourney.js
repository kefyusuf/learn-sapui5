/* Integration journey for example 04: add-product flow through the
   real dialog - open, fill, save, verify the refreshed catalog. */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"learn/controls/test/integration/pages/CatalogPage"
], function (opaTest, Opa5, CatalogPage) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new CatalogPage(),
		actions: new CatalogPage(),
		assertions: new CatalogPage(),
		viewNamespace: "learn.controls.view.",
		timeout: 20
	});

	opaTest("adds a product through the dialog", function (Given, When, Then) {
		Given.iStartTheApp()
			.and.iPressTheAddButton();

		Then.theDialogIsOpen(true);

		When.iEnterProductName("OPA Gadget")
			.and.iEnterPrice("19.99")
			.and.iSaveTheProduct();

		Then.theDialogIsOpen(false)
			.and.theCatalogShowsProduct("OPA Gadget")
			.and.iTeardown();
	});
});
