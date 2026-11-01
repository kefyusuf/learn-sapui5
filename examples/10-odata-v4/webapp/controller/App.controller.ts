import Controller from "sap/ui/core/mvc/Controller";
import Fragment from "sap/ui/core/Fragment";
import Dialog from "sap/m/Dialog";
import Input from "sap/m/Input";
import Select from "sap/m/Select";
import Table from "sap/m/Table";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import JSONModel from "sap/ui/model/json/JSONModel";
import { formatter } from "learn/odatav4/model/formatter";

/**
 * @namespace learn.odatav4.controller
 */
export default class AppController extends Controller {

	private oDialog: Dialog | null = null;
	private oEditDialog: Dialog | null = null;

	// Formatter adapters for the XML view (leading "." resolves here).
	public formatTotal(nTotal: string | number): string {
		return formatter.formatTotal(nTotal);
	}

	public formatStatusState(sStatus: string): string {
		return formatter.formatStatusState(sStatus);
	}

	public onInit(): void {
		// UI state model - backend data lives in the V4 model.
		this.getView()?.setModel(new JSONModel({ hasSelection: false }), "ui");
	}

	public onOrderSelected(oEvent: { getParameter(name: "listItem"): object | undefined }): void {
		const oItem = oEvent.getParameter("listItem") as
			| { getBindingContext(): { getPath(): string } | undefined }
			| undefined;
		const sPath = oItem?.getBindingContext()?.getPath() ?? "";

		// V4: query options are $-prefixed, and the expand keeps the relative
		// {Items} table of the detail panel filled in the same round trip.
		this.getView()?.bindElement({
			path: sPath,
			parameters: { $expand: "Items" }
		});
		(this.getView()?.getModel("ui") as JSONModel).setProperty("/hasSelection", Boolean(sPath));
	}

	public async onEditOrder(): Promise<void> {
		const oContext = (this.byId("ordersTable") as Table).getSelectedItem()?.getBindingContext();
		if (!oContext) {
			MessageBox.information(this._text("error.selectRow"));
			return;
		}

		// controller: this connects the fragment's press handlers (docs/09, M16).
		if (!this.oEditDialog) {
			this.oEditDialog = (await Fragment.load({
				name: "learn.odatav4.view.EditStatusDialog",
				id: this.getView()?.getId(),
				controller: this
			})) as Dialog;
			this.getView()?.addDependent(this.oEditDialog);
		}

		// Prefill from the selected order's context.
		const oUi = this.getView()?.getModel("ui") as JSONModel;
		oUi.setProperty("/edit/id", String(oContext.getProperty("ID")));
		oUi.setProperty("/edit/status", String(oContext.getProperty("Status")));
		this.oEditDialog.open();
	}

	public onCancelEdit(): void {
		this.oEditDialog?.close();
	}

	public onSaveEdit(): void {
		const oContext = (this.byId("ordersTable") as Table).getSelectedItem()?.getBindingContext();
		const sNewStatus = String((this.byId("statusSelect") as Select).getSelectedKey());
		if (!oContext || !sNewStatus) {
			return;
		}

		// V4 update: setProperty on the CONTEXT sends the PATCH - the row's
		// bindings update themselves (no refresh, no model.update). The cast
		// covers the typings gap for Context.setProperty in 1.152.
		(oContext as unknown as { setProperty(sPath: string, oValue: unknown): void })
			.setProperty("Status", sNewStatus);
		MessageToast.show(this._text("edit.done.message",
			[String(oContext.getProperty("ID")), sNewStatus]));
		this.oEditDialog?.close();
	}

	public onDeleteOrder(): void {
		const oTable = this.byId("ordersTable") as Table;
		const oContext = oTable.getSelectedItem()?.getBindingContext();
		if (!oContext) {
			// Visible feedback instead of a silent return (docs/12).
			MessageBox.information(this._text("error.selectRow"));
			return;
		}

		const sId = String(oContext.getProperty("ID"));
		const sCustomer = String(oContext.getProperty("Customer"));

		MessageBox.confirm(this._text("delete.confirm.text", [sId, sCustomer]), {
			title: this._text("delete.confirm.title"),
			onClose: (sAction: string | null) => {
				if (sAction !== MessageBox.Action.OK) {
					return;
				}
				// V4 delete: the CONTEXT knows its entity - one call, and the
				// list updates itself (no manual refresh, unlike V2). The
				// cast covers the typings gap for Context.delete in 1.152.
				void (oContext as unknown as { delete(sGroupId: string): Promise<void> })
					.delete("$auto").then(() => {
					MessageToast.show(this._text("deleted.message", [sId]));
				});
			}
		});
	}

	public async onAddOrder(): Promise<void> {
		// controller: this connects the fragment's press handlers (docs/09, M16).
		if (!this.oDialog) {
			this.oDialog = (await Fragment.load({
				name: "learn.odatav4.view.OrderDialog",
				id: this.getView()?.getId(),
				controller: this
			})) as Dialog;
			this.getView()?.addDependent(this.oDialog);
		}
		(this.byId("idInput") as Input)?.setValue("");
		(this.byId("customerInput") as Input)?.setValue("");
		this.oDialog.open();
	}

	public onCancelOrder(): void {
		this.oDialog?.close();
	}

	public async onCreateOrder(): Promise<void> {
		const oId = this.byId("idInput") as Input;
		const oCustomer = this.byId("customerInput") as Input;
		const sId = oId.getValue().trim();
		const sCustomer = oCustomer.getValue().trim();

		if (!sId || !sCustomer) {
			MessageBox.error(this._text("error.required"));
			return;
		}

		// V4 create: ODataListBinding.create adds a TRANSIENT row to the
		// list immediately; submitBatch persists it via POST - after the
		// batch succeeds the row stays without any manual refresh.
		const oTable = this.byId("ordersTable") as Table;
		const oBinding = oTable.getBinding("items") as ODataListBinding;
		const oCreatedContext = oBinding.create({
			ID: sId,
			Customer: sCustomer,
			OrderDate: new Date().toISOString().slice(0, 10),
			Status: "Open",
			Total: "0.00"
		});

		try {
			await (oBinding.getModel() as ODataModel).submitBatch(oBinding.getUpdateGroupId());
			this.oDialog?.close();
			MessageToast.show(this._text("created.message", [sId]) ?? "");
			void oCreatedContext;
		} catch (oError) {
			MessageBox.error((oError as Error).message ?? "Create failed");
		}
	}

	private _text(sKey: string, aArgs?: string[]): string {
		const oI18n = this.getView()?.getModel("i18n") as unknown as {
			getResourceBundle(): ResourceBundle;
		};
		return oI18n?.getResourceBundle().getText(sKey, aArgs) ?? sKey;
	}
}
