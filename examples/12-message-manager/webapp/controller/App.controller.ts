import Controller from "sap/ui/core/mvc/Controller";
import Fragment from "sap/ui/core/Fragment";
import Messaging from "sap/ui/core/Messaging";
import Dialog from "sap/m/Dialog";
import Button from "sap/m/Button";
import Table from "sap/m/Table";
import MessagePopover from "sap/m/MessagePopover";
import MessageToast from "sap/m/MessageToast";
import MessageBox from "sap/m/MessageBox";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import Context from "sap/ui/model/odata/v4/Context";
import ResourceBundle from "sap/base/i18n/ResourceBundle";

/**
 * @namespace learn.v4messages.controller
 *
 * Example 12: the intake form that talks back. The flow under test:
 * New order (transient V4 context + two-way bound form) -> a bad value in
 * the Edm.Decimal field raises a parse error -> handleValidation routes it
 * into the MessageManager -> the bell counts it and the MessagePopover
 * shows it -> fix the value -> save -> POST -> the row appears.
 */
export default class AppController extends Controller {

	private oDialog: Dialog | null = null;
	private oMessagePopover: MessagePopover | null = null;
	private oNewOrderContext: Context | null = null;

	public onInit(): void {
		// The Messaging facade's model - the MessagePopover binds it and the
		// bell button counts it. (Core.getMessageManager() hands back the
		// Messaging facade in 1.152 - it has NO attachMessageChange.)
		this.getView()?.setModel(Messaging.getMessageModel(), "message");

		// The bell: a formatter binding re-evaluates on every message change.
		(this.byId("messageButton") as Button).bindProperty("text", {
			path: "message>/",
			formatter: (aMessages: unknown[]) =>
				Array.isArray(aMessages) && aMessages.length > 0
					? String(aMessages.length)
					: ""
		});
	}

	/**
	 * Creates the TRANSIENT context first, then opens a form two-way bound
	 * to it. Typing into the Edm.Decimal "Total" field with a non-number
	 * raises a parse error - with handleValidation: true the core routes
	 * it into the MessageManager instead of throwing.
	 */
	public onNewOrder(): void {
		const oTable = this.byId("ordersTable") as Table;
		const oBinding = oTable.getBinding("items") as ODataListBinding;

		// A deterministic key for the example: mock data ships SO-2001..2003.
		const sNewId = `SO-${2000 + oBinding.getLength() + 1}`;
		this.oNewOrderContext = oBinding.create({
			ID: sNewId,
			Customer: "",
			OrderDate: new Date().toISOString().slice(0, 10),
			Status: "Open",
			Total: "0.00"
		});

		void this._openDialog(sNewId);
	}

	private async _openDialog(sNewId: string): Promise<void> {
		if (!this.oDialog) {
			this.oDialog = (await Fragment.load({
				name: "learn.v4messages.view.NewOrderDialog",
				id: this.getView()?.getId(),
				controller: this // M16: without it, all press handlers are dead
			})) as Dialog;
			this.getView()?.addDependent(this.oDialog);
		}
		// The dialog's binding context IS the transient context - the
		// form's {Customer} / {Total} bindings write straight into it.
		this.oDialog.setBindingContext(this.oNewOrderContext as Context);
		this.oDialog.open();
	}

	public onCancelOrder(): void {
		this.oDialog?.close();
	}

	public async onSaveOrder(): Promise<void> {
		// The classic gate: do not submit while validation messages exist.
		const aMessages = Messaging.getMessageModel().getData() as unknown[];
		if (aMessages.length > 0) {
			MessageBox.error(this._text("neworder.fix.errors") ?? "");
			return;
		}

		const oBinding = (this.byId("ordersTable") as Table)
			.getBinding("items") as ODataListBinding;
		try {
			await (oBinding.getModel() as ODataModel)
				.submitBatch(oBinding.getUpdateGroupId());
			const sId = String(this.oNewOrderContext?.getProperty("ID") ?? "");
			this.oDialog?.close();
			MessageToast.show(this._text("neworder.created.message", [sId]) ?? "");
		} catch (oError) {
			MessageBox.error((oError as Error).message ?? "Create failed");
		}
	}

	public async onMessagePopoverPress(
		oEvent: { getSource(): unknown }
	): Promise<void> {
		if (!this.oMessagePopover) {
			this.oMessagePopover = (await Fragment.load({
				name: "learn.v4messages.view.MessagePopover",
				id: this.getView()?.getId(),
				controller: this // M16
			})) as MessagePopover;
			this.getView()?.addDependent(this.oMessagePopover);
		}
		void this.oMessagePopover.toggle(oEvent.getSource() as Button);
	}

	private _text(sKey: string, aArgs?: string[]): string | undefined {
		const oBundle = (this.getView()?.getModel("i18n") as unknown as
			{ getResourceBundle(): ResourceBundle } | undefined)
			?.getResourceBundle();
		return oBundle ? oBundle.getText(sKey, aArgs ?? []) : undefined;
	}
}
