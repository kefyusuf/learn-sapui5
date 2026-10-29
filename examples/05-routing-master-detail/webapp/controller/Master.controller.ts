import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import StandardListItem from "sap/m/StandardListItem";
import Context from "sap/ui/model/Context";
import Router from "sap/ui/core/routing/Router";

/**
 * @namespace learn.routing.controller
 */
export default class MasterController extends Controller {

	public formatStatus(sStatus: string): string {
		switch (sStatus) {
			case "Shipped": return "Success";
			case "Processing": return "Warning";
			default: return "None";
		}
	}

	public onOrderSelected(oEvent: { getParameter(name: "listItem"): object | undefined }): void {
		const oItem = oEvent.getParameter("listItem") as StandardListItem;
		// Every list item knows its binding context - getObject() returns
		// the order the item is bound to. We pass its real id to the route.
		const oOrder = (oItem.getBindingContext() as Context | undefined)?.getObject() as
			| { id: string }
			| undefined;
		if (!oOrder) {
			return;
		}
		(UIComponent.getRouterFor(this) as Router).navTo("detail", {
			orderId: oOrder.id
		});
	}
}
