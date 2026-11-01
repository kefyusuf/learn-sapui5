import Controller from "sap/ui/core/mvc/Controller";
import XMLView from "sap/ui/core/mvc/XMLView";
import FlexibleColumnLayout from "sap/f/FlexibleColumnLayout";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Table from "sap/m/Table";
import Button from "sap/m/Button";
import MessageBox from "sap/m/MessageBox";

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

					(oItemDetailView.byId("deleteItemButton") as Button).attachPress(
						() => this.confirmDeleteItem(oFCL, oItemDetailView)
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

	/**
	 * V4 delete: Context.delete sends the DELETE request. NOTE (M20): the
	 * $expand-ed items table does NOT update itself afterwards - the caller
	 * unbinds and re-binds the Detail to re-read. On success: back to two
	 * columns.
	 */
	private confirmDeleteItem(
		oFCL: FlexibleColumnLayout,
		oItemDetailView: XMLView
	): void {
		const oItemContext = oItemDetailView.getBindingContext();
		if (!oItemContext) {
			return;
		}
		// 1.152: the ResourceModel instance has no getText of its own - go
		// through getResourceBundle() (a typings gap: cast to reach it).
		const oI18n = (this.getView()?.getModel("i18n") as unknown as
			{ getResourceBundle(): ResourceBundle } | undefined)
			?.getResourceBundle();
		MessageBox.confirm(
			oI18n
				? String(oI18n.getText("delete.confirm", [String(oItemContext.getProperty("Product"))]))
				: "Delete item?",
			{
				title: oI18n ? String(oI18n.getText("delete.title")) : "Delete item",
				onClose: (sAction: string | null) => {
					if (sAction !== MessageBox.Action.OK) {
						return;
					}
					// The cast covers the typings gap for Context.delete in 1.152.
					// NOTE: we deliberately do NOT await the promise for the UI
					// update - with $expand-ed collections it may never settle
					// even though the DELETE is submitted (204 on the wire).
					(oItemContext as unknown as { delete(): Promise<void> }).delete()
						.catch((oError: unknown) => MessageBox.error(String(oError)));

					// The V4 model does NOT auto-update an $expand-ed collection
					// after a DELETE, and its bindings do not support refresh()
					// ("Refresh on this binding is not supported"). Force a clean
					// re-read: drop the element binding (which releases the model
					// cache) and re-bind - the fresh GET sees the post-delete data.
					const sOrderPath = this.oDetailView?.getBindingContext()?.getPath();
					if (sOrderPath && this.oDetailView) {
						this.oDetailView.unbindElement();
						this.oDetailView.bindElement({
							path: sOrderPath,
							parameters: { $expand: "Items" }
						});
					}
					oFCL.setLayout("TwoColumnsMidExpanded");
				}
			}
		);
	}
}
