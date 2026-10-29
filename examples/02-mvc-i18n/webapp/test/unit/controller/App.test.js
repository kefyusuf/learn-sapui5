/* Controller unit tests for the HR welcome card (example 02).
 *
 * Same pattern as example 04: the controller is instantiated standalone
 * with a sinon sandbox; view/models are fakes, the i18n bundle echoes
 * keys and args so the tests verify HOW the greeting is composed.
 */
sap.ui.define([
	"learn/mvc/controller/App.controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4"
], function (AppController, MessageToast, JSONModel, sinon4) {
	"use strict";

	const sinon = (sinon4 && typeof sinon4.stub === "function") ? sinon4 : window.sinon;

	QUnit.module("controller (HR welcome card)", {
		beforeEach: function () {
			this.sb = sinon.createSandbox();
			this.oToast = this.sb.stub(MessageToast, "show");
			this.oController = new AppController();

			// The default model the controller creates in onInit.
			this.oEmployeeModel = new JSONModel({
				employee: {
					name: "Maria Kaya",
					department: "Finance",
					role: "Accounts Payable Specialist",
					startDate: "2021-04-12"
				}
			});

			sinon.stub(this.oController, "getView").returns({
				setModel: this.sb.spy(),
				getModel: (sName) => {
					if (sName === "i18n") {
						// Echo key + args: asserts that the name flows into
						// the greeting as a bundle parameter.
						return {
							getResourceBundle: () => Promise.resolve({
								getText: (sKey, aArgs) => sKey + (aArgs ? "|" + aArgs.join(",") : "")
							})
						};
					}
					return this.oEmployeeModel;
				}
			});
		},
		afterEach: function () {
			this.sb.restore();
		}
	});

	QUnit.test("onInit attaches the employee model to the view", function (assert) {
		this.oController.onInit();

		const oSetModel = this.oController.getView().setModel;
		assert.strictEqual(oSetModel.callCount, 1, "one model attached");
		assert.ok(oSetModel.firstCall.args[0] instanceof JSONModel, "the model is a JSONModel");
	});

	QUnit.test("onSayHi greets the employee by name via i18n", async function (assert) {
		await this.oController.onSayHi();

		assert.strictEqual(this.oToast.callCount, 1, "greeting toast shown");
		assert.strictEqual(this.oToast.firstCall.args[0],
			"greeting.message|Maria Kaya",
			"greeting key used with the employee name as parameter");
	});
});
