import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageToast from "sap/m/MessageToast";
import ResourceBundle from "sap/base/i18n/ResourceBundle";

/**
 * @namespace learn.rating.controller
 *
 * Example 13: hosts the CUSTOM RatingIndicator control. The app's model is
 * a plain JSONModel - the example is about the CONTROL layer (metadata,
 * renderer, events, two-way), not about OData.
 */
export default class AppController extends Controller {

	public onInit(): void {
		this.getView()?.setModel(new JSONModel({ rating: 2 }));
	}

	public onRate(oEvent: { getParameter(sName: string): unknown }): void {
		const sText = (this.getView()?.getModel("i18n") as unknown as
			{ getResourceBundle(): ResourceBundle } | undefined)
			?.getResourceBundle()
			?.getText("rate.toast", [String(oEvent.getParameter("value"))]);
		MessageToast.show(sText ?? "");
	}
}
