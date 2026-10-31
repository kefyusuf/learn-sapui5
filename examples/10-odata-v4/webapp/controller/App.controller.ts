import Controller from "sap/ui/core/mvc/Controller";
import Fragment from "sap/ui/core/Fragment";
import Dialog from "sap/m/Dialog";
import Input from "sap/m/Input";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import Table from "sap/m/Table";
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
