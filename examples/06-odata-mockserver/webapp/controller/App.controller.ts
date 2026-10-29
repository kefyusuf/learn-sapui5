import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import { formatter } from "learn/odata/model/formatter";

/**
 * @namespace learn.odata.controller
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
		// UI state model - separate from the OData model. A good habit:
		// backend data lives in the OData model, app state (selections,
		// flags) in a small named JSON model.
		this.getView()?.setModel(new JSONModel({ selectedPath: "" }), "ui");
	}

	public onOrderSelected(oEvent: { getParameter(name: "listItem"): object | undefined }): void {
		const oItem = oEvent.getParameter("listItem") as { getBindingContext(): { getPath(): string } | undefined };
		const sPath = oItem?.getBindingContext()?.getPath() ?? "";
		// bindElement with $expand: one request fetches order + its items.
		this.getView()?.bindElement(sPath, { expand: "Items" });
		(this.getView()?.getModel("ui") as JSONModel).setProperty("/selectedPath", sPath);
	}
}
