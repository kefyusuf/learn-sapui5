import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import MessageBox from "sap/m/MessageBox";
import History from "sap/ui/core/routing/History";
import JSONModel from "sap/ui/model/json/JSONModel";

interface OrderLike {
	id: string;
}

/**
 * @namespace learn.routing.controller
 */
export default class DetailController extends Controller {

	public formatStatus(sStatus: string): string {
		switch (sStatus) {
			case "Shipped": return "Success";
			case "Processing": return "Warning";
			default: return "None";
		}
	}

	public formatTotal(nTotal: number): string {
		return typeof nTotal === "number"
			? new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(nTotal)
			: "";
	}

	public onInit(): void {
		// attachPatternMatched fires ONLY for the "detail" route - use it
		// instead of the broader attachRouteMatched (M10 explains why).
		UIComponent.getRouterFor(this).getRoute("detail")?.attachPatternMatched(
			async (oEvent) => {
				await this.onPatternMatched(oEvent);
			},
			this
		);
	}

	public async onPatternMatched(oEvent: { getParameter(name: "arguments"): object | undefined }): Promise<void> {
		const oArgs = oEvent.getParameter("arguments") as { orderId: string } | undefined;
		const sOrderId = oArgs?.orderId ?? "";
		const oModel = this.getView()?.getModel() as JSONModel | undefined;
		if (!oModel) {
			return;
		}

		// Route parameters are strings; find the order by its business id.
		const aOrders = oModel.getProperty("/orders") as OrderLike[];
		const iIndex = aOrders.findIndex((o) => o.id === decodeURIComponent(sOrderId));

		if (iIndex === -1) {
			const oI18nModel = this.getView()?.getModel("i18n") as unknown as {
				getResourceBundle(): Promise<ResourceBundle>;
			} | undefined;
			if (oI18nModel) {
				const oBundle = await oI18nModel.getResourceBundle();
				MessageBox.error(oBundle.getText("detail.notFound", [sOrderId]) ?? "");
				UIComponent.getRouterFor(this).navTo("list");
			}
			return;
		}

		// bindElement points all relative bindings in this view
		// (title="{id}", items="{items}") at the selected order.
		this.getView()?.bindElement(`/orders/${iIndex}`);
	}

	public onNavBack(): void {
		// Back through browser history, falling back to the list route.
		const sPreviousHash = History.getInstance().getPreviousHash();
		if (sPreviousHash !== undefined) {
			window.history.go(-1);
		} else {
			UIComponent.getRouterFor(this).navTo("list", {}, true);
		}
	}
}
