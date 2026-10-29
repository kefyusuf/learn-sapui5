import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import StandardListItem from "sap/m/StandardListItem";
import Context from "sap/ui/model/Context";
import Router from "sap/ui/core/routing/Router";
import { formatter } from "learn/routing/model/formatter";

/**
 * @namespace learn.routing.controller
 */
export default class MasterController extends Controller {

	// Thin adapter for the XML view: "." resolves here, the rule lives in
	// the tested formatter module.
	public formatStatus(sStatus: string): string {
		return formatter.formatStatus(sStatus);
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
