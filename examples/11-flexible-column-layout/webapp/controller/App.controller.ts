import Controller from "sap/ui/core/mvc/Controller";
import XMLView from "sap/ui/core/mvc/XMLView";
import FlexibleColumnLayout from "sap/f/FlexibleColumnLayout";
import Table from "sap/m/Table";

/**
 * @namespace learn.fcl.controller
 *
 * FCL WITHOUT routing: the App controller owns the whole flow - it places
 * the Master view into the begin column, listens to the table's
 * selectionChange and drives the Detail view + the layout switches.
 * (The routing-based variant stalled in this environment - docs/12.)
 */
export default class AppController extends Controller {

	private oDetailView: XMLView | null = null;

	public onInit(): void {
		const oFCL = this.byId("fcl") as FlexibleColumnLayout;

		void XMLView.create({
			viewName: "learn.fcl.view.Master"
		}).then((oMasterView) => {
			oFCL.addBeginColumnPage(oMasterView);
			oFCL.setLayout("OneColumn");

			// The master table's selection drives the whole flow.
			(oMasterView.byId("ordersTable") as Table).attachSelectionChange(
				(oEvent) => {
					const oItem = oEvent.getParameter("listItem") as
						| { getBindingContext(): { getPath(): string } | undefined }
						| undefined;
					const sPath = oItem?.getBindingContext()?.getPath() ?? "";
					if (!sPath) {
						return;
					}

					// The Detail view: created lazily on the first selection.
					if (!this.oDetailView) {
						void XMLView.create({ viewName: "learn.fcl.view.Detail" }).then(
							(oDetailView) => {
								this.oDetailView = oDetailView;
								oFCL.addMidColumnPage(oDetailView);
								oDetailView.bindElement({
									path: sPath,
									parameters: { $expand: "Items" }
								});
								oFCL.setLayout("TwoColumnsMidExpanded");
							}
						);
						return;
					}
					this.oDetailView.bindElement({
						path: sPath,
						parameters: { $expand: "Items" }
					});
					oFCL.setLayout("TwoColumnsMidExpanded");
				}
			);
		});
	}
}
