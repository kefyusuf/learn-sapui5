/* Controller unit tests for the delete flow (example 07).
 *
 * The "shows information when no row is selected" test is TDD-RED for
 * the new visible-feedback behavior (docs/12): the controller used to
 * return silently. Sinon sandbox + fakes, same pattern as example 04. */
sap.ui.define([
	"learn/crud/controller/App.controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/thirdparty/sinon-4"
], function (AppController, MessageBox, MessageToast, sinon4) {
	"use strict";

	const sinon = (sinon4 && typeof sinon4.stub === "function") ? sinon4 : window.sinon;

	QUnit.module("controller.onDeleteRequest", {
		beforeEach: function () {
			this.sb = sinon.createSandbox();
			this.oInformation = this.sb.stub(MessageBox, "information");
			this.oConfirm = this.sb.stub(MessageBox, "confirm");
			this.oToast = this.sb.stub(MessageToast, "show");

			this.oController = new AppController();

			// Fake OData model: remove succeeds and records the path.
			this.sRemovedPath = null;
			this.oModel = {
				remove: (sPath, mParams) => {
					this.sRemovedPath = sPath;
					mParams.success();
				}
			};

			// Fake table: rows selectable via this.sSelectedId.
			this.sSelectedId = null;
			this.oRefreshSpy = this.sb.spy();
			const oFakeTable = {
				getBinding: () => ({ refresh: this.oRefreshSpy }),
				getSelectedItem: () => {
					if (!this.sSelectedId) {
						return null;
					}
					return {
						getBindingContext: () => ({
							getPath: () => `/LeaveRequestSet('${this.sSelectedId}')`,
							getProperty: (sProp) => (sProp === "ID" ? this.sSelectedId : `${sProp}:${this.sSelectedId}`)
						})
					};
				}
			};

			sinon.stub(this.oController, "getView").returns({
				getModel: (sName) => {
					if (sName === "i18n") {
						// Echo key AND args: the confirm text must contain
						// the interpolated id.
						return { getResourceBundle: () => Promise.resolve({ getText: (sKey, aArgs) => sKey + (aArgs ? "|" + aArgs.join(",") : "") }) };
					}
					return this.oModel;
				}
			});
			// The controller resolves controls through ITS OWN byId - stub
			// that (not the view's) for a view-less controller (docs/12).
			this.sb.stub(this.oController, "byId").callsFake((sId) => {
				if (sId === "requestsTable") {
					return oFakeTable;
				}
				return null;
			});

			// Preload the bundle like onInit does - and inject the fake
			// bundle directly (onInit's preload is fire-and-forget).
			this.oController.oBundle = { getText: (sKey, aArgs) => sKey + (aArgs ? "|" + aArgs.join(",") : "") };
			return this.oController.onInit();
		},
		afterEach: function () {
			this.sb.restore();
		}
	});

	QUnit.test("shows information when no row is selected", async function (assert) {
		this.sSelectedId = null;

		await this.oController.onDeleteRequest();

		assert.strictEqual(this.oInformation.callCount, 1, "information shown");
		assert.strictEqual(this.oInformation.firstCall.args[0], "error.selectRow", "selection hint key used");
		assert.strictEqual(this.oConfirm.callCount, 0, "no confirm dialog");
	});

	QUnit.test("asks for confirmation with the selected request", async function (assert) {
		this.sSelectedId = "LR-0001";

		await this.oController.onDeleteRequest();

		assert.strictEqual(this.oConfirm.callCount, 1, "confirmation requested");
		assert.ok(this.oConfirm.firstCall.args[0].indexOf("LR-0001") > -1, "confirm text contains the id");
		assert.strictEqual(this.sRemovedPath, null, "nothing removed before confirmation");
	});

	QUnit.test("removes the request after confirmation", async function (assert) {
		this.sSelectedId = "LR-0002";

		await this.oController.onDeleteRequest();

		const mConfirmOptions = this.oConfirm.firstCall.args[1];
		mConfirmOptions.onClose(MessageBox.Action.OK);

		assert.strictEqual(this.sRemovedPath, "/LeaveRequestSet('LR-0002')", "remove called on the selected path");
		assert.strictEqual(this.oToast.callCount, 1, "toast shown");
		assert.strictEqual(this.oRefreshSpy.callCount, 1, "list refreshed");
	});
});
