import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import FlexibleColumnLayout from "sap/f/FlexibleColumnLayout";

/**
 * @namespace learn.fcl.controller
 *
 * The root view's controller owns the FlexibleColumnLayout: each route
 * maps to a layout (OneColumn for the list, TwoColumnsMidExpanded when
 * a detail is open). The pattern is from SAP's freestyle FCL samples.
 */
export default class AppController extends Controller {

	public onInit(): void {
		const oFCL = this.byId("fcl") as FlexibleColumnLayout;
		const oRouter = UIComponent.getRouterFor(this);

		oRouter.getRoute("master")?.attachMatched(() => {
			oFCL.setLayout("OneColumn");
		});
		oRouter.getRoute("detail")?.attachMatched(() => {
			oFCL.setLayout("TwoColumnsMidExpanded");
		});
	}
}
