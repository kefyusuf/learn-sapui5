import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import { formatter } from "learn/fcl/model/formatter";

/**
 * @namespace learn.fcl.controller
 */
export default class MasterController extends Controller {

	// Formatter adapters for the XML view (leading "." resolves here).
	public formatTotal(nTotal: string | number): string {
		return formatter.formatTotal(nTotal);
	}

	public formatStatusState(sStatus: string): string {
		return formatter.formatStatusState(sStatus);
	}

	public onOrderSelected(oEvent: { getParameter(name: "listItem"): object | undefined }): void {
		const oItem = oEvent.getParameter("listItem") as
			| { getBindingContext(): { getPath(): string; getProperty(sProp: string): unknown } | undefined }
			| undefined;
		const oContext = oItem?.getBindingContext();
		if (!oContext) {
			return;
		}

		// FCL navigation: the detail route opens the MID column; the App
		// controller switches the layout to TwoColumnsMidExpanded.
		UIComponent.getRouterFor(this).navTo("detail", {
			orderId: String(oContext.getProperty("ID"))
		});
	}
}
