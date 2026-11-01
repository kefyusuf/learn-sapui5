import Controller from "sap/ui/core/mvc/Controller";
import Routing from "sap/ui/core/routing/Route";
import UIComponent from "sap/ui/core/UIComponent";
import { formatter } from "learn/fcl/model/formatter";

/**
 * @namespace learn.fcl.controller
 */
export default class DetailController extends Controller {

	// Formatter adapters for the XML view (leading "." resolves here).
	public formatTotal(nTotal: string | number): string {
		return formatter.formatTotal(nTotal);
	}

	public onInit(): void {
		// attachMatched fires for the "detail" route - bind the view to
		// the selected order with the items expanded in one round trip.
		UIComponent.getRouterFor(this).getRoute("detail")?.attachMatched(
			(oEvent) => {
				const sOrderId = (oEvent.getParameter("arguments") as { orderId: string }).orderId;
				this.getView()?.bindElement({
					path: `/SalesOrders('${sOrderId}')`,
					parameters: { $expand: "Items" }
				});
			}
		);
	}
}
