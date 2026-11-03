import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";

/**
 * @namespace learn.smart.controller
 *
 * Example 15: the form builds itself - the SmartFields read the entity's
 * $metadata (types, validation, the DateTime picker) and render
 * accordingly. The element binding roots the fields in ONE concrete
 * order; saving flushes the V2 model's pending changes (two-way).
 */
export default class AppController extends Controller {

	public onInit(): void {
		// root the form in one concrete order
		this.getView()?.bindElement({
			path: "/SalesOrderSet('SO-1001')"
		});
	}

	public onSave(): void {
		const oModel = this.getView()?.getModel() as ODataModel | undefined;
		if (!oModel) {
			return;
		}
		// the SmartFields wrote into the model via the two-way bindings;
		// submitChanges sends the MERGE
		oModel.submitChanges({
			success: () => {
				const sId = String(this.getView()?.getBindingContext()?.getProperty("ID") ?? "");
				MessageToast.show(this._text("form.saved.message", [sId]) ?? "");
			},
			error: (oError: { message?: string }) => {
				MessageToast.show(oError.message ?? "Save failed");
			}
		});
	}

	private _text(sKey: string, aArgs?: string[]): string | undefined {
		const oBundle = (this.getView()?.getModel("i18n") as unknown as
			{ getResourceBundle(): ResourceBundle } | undefined)
			?.getResourceBundle();
		return oBundle ? oBundle.getText(sKey, aArgs ?? []) : undefined;
	}
}
