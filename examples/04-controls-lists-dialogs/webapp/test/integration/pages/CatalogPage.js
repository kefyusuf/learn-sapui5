/* Page object for the product catalog - the add-product dialog flow. */
sap.ui.define(["sap/ui/test/Opa5", "sap/ui/test/actions/Press", "sap/ui/test/actions/EnterText"],
	function (Opa5, Press, EnterText) {
	"use strict";

	return Opa5.extend("learn.controls.test.integration.pages.CatalogPage", {

		iStartTheApp: function () {
			return this.iStartMyUIComponent({
				componentConfig: {
					name: "learn.controls",
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
				id: "addButton",
				actions: new Press(),
				errorMessage: "Did not find the add button in the footer"
			});
		},

		iEnterProductName: function (sName) {
			return this.waitFor({
				viewName: "App",
				id: "nameInput",
				actions: new EnterText({ text: sName }),
				errorMessage: "Did not find the product name input (is the dialog open?)"
			});
		},

		iEnterPrice: function (sPrice) {
			return this.waitFor({
				viewName: "App",
				id: "priceInput",
				actions: new EnterText({ text: sPrice }),
				errorMessage: "Did not find the price input"
			});
		},

		iSaveTheProduct: function () {
			return this.waitFor({
				viewName: "App",
				id: "dialogSave",
				actions: new Press(),
				errorMessage: "Did not find the dialog save button"
			});
		},

		theDialogIsOpen: function (bOpen) {
			return this.waitFor({
				viewName: "App",
				id: "addDialog",
				// a CLOSED dialog has no DOM - visibility checks would never run
				visible: false,
				// poll: the dialog closes ASYNC after the save round trip
				check: function (oDialog) {
					return oDialog.isOpen() === bOpen;
				},
				success: function (oDialog) {
					Opa5.assert.strictEqual(oDialog.isOpen(), bOpen,
						`dialog open is ${bOpen}`);
				},
				errorMessage: `Dialog never reached open=${bOpen}`
			});
		},

		theCatalogShowsProduct: function (sName) {
			return this.waitFor({
				viewName: "App",
				id: "productList",
				// check keeps polling until the refreshed binding shows the row
				check: function (oList) {
					return oList.getItems().some((oItem) => oItem.getTitle() === sName);
				},
				success: function (oList) {
					Opa5.assert.ok(true, `catalog shows "${sName}"`);
				},
				errorMessage: `The catalog never showed "${sName}" after refresh`
			});
		}
	});
});
