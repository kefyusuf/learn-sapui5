/* Controller unit tests for the add-product flow.
 *
 * The controller is instantiated standalone; view/controls/i18n are
 * replaced with fakes and spies so the tests exercise ONLY the logic.
 * The "shows an error" tests are TDD-RED for the new validation
 * feedback behavior (docs/12-testing-tdd.md).
 *
 * Sinon ships inside the UI5 runtime as sap/ui/thirdparty/sinon-4 - but
 * its UMD wrapper registers with the UI5 loader (define is present), so
 * it must be required through the loader, NOT read from window.sinon.
 */
sap.ui.define([
	"learn/controls/controller/App.controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4"
], function (AppController, MessageBox, MessageToast, JSONModel, sinon4) {
	"use strict";

	const sinon = (sinon4 && typeof sinon4.stub === "function") ? sinon4 : window.sinon;

	QUnit.module("controller.onSaveProduct", {
		beforeEach: function () {
			// Sinon 4 has no top-level restore - use a sandbox and restore it.
			this.sb = sinon.createSandbox();
			// Fresh model per test - the assertions read written state.
			this.oModel = new JSONModel({ products: [] });
			this.oMessageBoxError = this.sb.stub(MessageBox, "error");
			this.oToast = this.sb.stub(MessageToast, "show");

			this.oController = new AppController();
			this.oDialog = { open: this.sb.spy(), close: this.sb.spy() };
			this.oController.oDialog = this.oDialog;

			this.sb.stub(this.oController, "getView").returns({
				getModel: (sName) => {
					if (sName === "i18n") {
						// Fake bundle echoes the key - good enough for
						// asserting WHICH message the controller shows.
						return { getResourceBundle: () => Promise.resolve({ getText: (sKey) => sKey }) };
					}
					return this.oModel;
				},
				addDependent: function () {},
				getId: () => "testView"
			});
			this.sb.stub(this.oController, "byId").callsFake((sId) => {
				switch (sId) {
					case "nameInput": return { getValue: () => this.sName, setValue: this.sb.spy() };
					case "priceInput": return { getValue: () => this.sPrice, setValue: this.sb.spy() };
					case "stockInput": return { getSelected: () => true };
					default: return null;
				}
			});
		},
		afterEach: function () {
			this.sb.restore();
		}
	});

	QUnit.test("adds a valid product, closes the dialog and toasts", async function (assert) {
		this.sName = "Test Gadget";
		this.sPrice = "9.99";

		await this.oController.onSaveProduct();

		const aProducts = this.oModel.getProperty("/products");
		assert.strictEqual(aProducts.length, 1, "product added to the model");
		assert.strictEqual(aProducts[0].name, "Test Gadget", "correct name");
		assert.strictEqual(aProducts[0].price, 9.99, "price converted to number");
		assert.strictEqual(aProducts[0].stock, 10, "in-stock checkbox mapped to 10");
		assert.strictEqual(this.oDialog.close.callCount, 1, "dialog closed");
		assert.strictEqual(this.oMessageBoxError.callCount, 0, "no error shown");
		assert.strictEqual(this.oToast.callCount, 1, "confirmation toast shown");
	});

	QUnit.test("shows an error and keeps the dialog open for an empty name", async function (assert) {
		this.sName = "   ";
		this.sPrice = "9.99";

		await this.oController.onSaveProduct();

		assert.strictEqual(this.oMessageBoxError.callCount, 1, "error shown");
		assert.strictEqual(this.oMessageBoxError.firstCall.args[0], "error.name", "name error key used");
		assert.strictEqual(this.oModel.getProperty("/products").length, 0, "nothing added");
		assert.strictEqual(this.oDialog.close.callCount, 0, "dialog stays open");
	});

	QUnit.test("shows an error and keeps the dialog open for a non-positive price", async function (assert) {
		this.sName = "Test Gadget";
		this.sPrice = "0";

		await this.oController.onSaveProduct();

		assert.strictEqual(this.oMessageBoxError.callCount, 1, "error shown");
		assert.strictEqual(this.oMessageBoxError.firstCall.args[0], "error.price", "price error key used");
		assert.strictEqual(this.oModel.getProperty("/products").length, 0, "nothing added");
		assert.strictEqual(this.oDialog.close.callCount, 0, "dialog stays open");
	});
});
