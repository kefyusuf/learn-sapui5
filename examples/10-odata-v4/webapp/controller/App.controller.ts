import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import { formatter } from "learn/odatav4/model/formatter";

/**
 * @namespace learn.odatav4.controller
 */
export default class AppController extends Controller {

	// Formatter adapters for the XML view (leading "." resolves here).
	public formatTotal(nTotal: string | number): string {
		return formatter.formatTotal(nTotal);
	}

	public formatStatusState(sStatus: string): string {
		return formatter.formatStatusState(sStatus);
	}

	public onInit(): void {
		// UI state model - backend data lives in the V4 model.
		this.getView()?.setModel(new JSONModel({ hasSelection: false }), "ui");
	}

	public onOrderSelected(oEvent: { getParameter(name: "listItem"): object | undefined }): void {
		const oItem = oEvent.getParameter("listItem") as
			| { getBindingContext(): { getPath(): string } | undefined }
			| undefined;
		const sPath = oItem?.getBindingContext()?.getPath() ?? "";

		// V4: query options are $-prefixed, and the expand keeps the relative
		// {Items} table of the detail panel filled in the same round trip.
		this.getView()?.bindElement({
			path: sPath,
			parameters: { $expand: "Items" }
		});
		(this.getView()?.getModel("ui") as JSONModel).setProperty("/hasSelection", Boolean(sPath));
	}
}
