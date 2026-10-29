/* Controller unit tests for example 01 - the hello greeting.
 * Sinon ships in the UI5 runtime (sap/ui/thirdparty/sinon-4) and must be
 * required through the loader - its UMD registers with the UI5 loader, so
 * window.sinon stays undefined (docs/12).
 */
sap.ui.define([
	"learn/helloworld/controller/App.controller",
	"sap/m/MessageToast",
	"sap/ui/thirdparty/sinon-4"
], function (AppController, MessageToast, sinon4) {
	"use strict";

	const sinon = (sinon4 && typeof sinon4.stub === "function") ? sinon4 : window.sinon;

	QUnit.module("controller.onSayHello", {
		beforeEach: function () {
			this.sb = sinon.createSandbox();
			this.oToast = this.sb.stub(MessageToast, "show");
			this.oController = new AppController();

			this.sName = "";
			this.sb.stub(this.oController, "byId").withArgs("nameInput").returns({
				getValue: () => this.sName
			});
		},
		afterEach: function () {
			this.sb.restore();
		}
	});

	QUnit.test("greets with the typed name", function (assert) {
		this.sName = "Maria";

		this.oController.onSayHello();

		assert.strictEqual(this.oToast.firstCall.args[0], "Hello, Maria!");
	});

	QUnit.test("falls back to 'world' when the input is empty", function (assert) {
		this.sName = "   ";

		this.oController.onSayHello();

		assert.strictEqual(this.oToast.firstCall.args[0], "Hello, world!");
	});
});
