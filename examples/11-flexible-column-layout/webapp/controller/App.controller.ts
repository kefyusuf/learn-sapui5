import Controller from "sap/ui/core/mvc/Controller";
import XMLView from "sap/ui/core/mvc/XMLView";
import FlexibleColumnLayout from "sap/f/FlexibleColumnLayout";
import Table from "sap/m/Table";
import Button from "sap/m/Button";

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
	private oItemDetailView: XMLView | null = null;

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

								// The items table press drives the THIRD column.
								// Attached once - the Detail view is created once.
								(oDetailView.byId("itemsTable") as Table).attachItemPress(
									(oItemEvent) => this.openItemDetail(oFCL, oItemEvent)
								);

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

	/**
	 * The third column: the pressed item's detail in the end column.
	 * Same lazy pattern as the Detail view. The close button is wired HERE
	 * because the ItemDetail view is deliberately controller-less - one
	 * navigation owner (this controller), like the rest of the flow.
	 */
	private openItemDetail(
		oFCL: FlexibleColumnLayout,
		oEvent: { getParameter(sName: string): unknown }
	): void {
		const oListItem = oEvent.getParameter("listItem") as
			| { getBindingContext(): { getPath(): string } | undefined }
			| undefined;
		const sItemPath = oListItem?.getBindingContext()?.getPath() ?? "";
		if (!sItemPath) {
			return;
		}

		if (!this.oItemDetailView) {
			void XMLView.create({ viewName: "learn.fcl.view.ItemDetail" }).then(
				(oItemDetailView) => {
					this.oItemDetailView = oItemDetailView;
					oFCL.addEndColumnPage(oItemDetailView);
					oItemDetailView.bindElement({ path: sItemPath });

					(oItemDetailView.byId("closeItemButton") as Button).attachPress(
						() => oFCL.setLayout("TwoColumnsMidExpanded")
					);

					oFCL.setLayout("ThreeColumnsMidExpanded");
				},
				// A silent rejection here shows up as "nothing happens" in the
				// app - log it (the headless runner surfaces console.error).
				(oError: unknown) => console.error("ItemDetail view failed to load", oError)
			);
			return;
		}
		this.oItemDetailView.bindElement({ path: sItemPath });
		oFCL.setLayout("ThreeColumnsMidExpanded");
	}
}
