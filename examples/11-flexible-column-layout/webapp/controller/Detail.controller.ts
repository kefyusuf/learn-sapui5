import Controller from "sap/ui/core/mvc/Controller";
import Fragment from "sap/ui/core/Fragment";
import Dialog from "sap/m/Dialog";
import Select from "sap/m/Select";
import MessageBox from "sap/m/MessageBox";
import { formatter } from "learn/fcl/model/formatter";

/**
 * @namespace learn.fcl.controller
 */
export default class DetailController extends Controller {

	private oEditDialog: Dialog | null = null;

	// Formatter adapters for the XML view (leading "." resolves here).
	public formatTotal(nTotal: string | number): string {
		return formatter.formatTotal(nTotal);
	}

	public async onEditStatus(): Promise<void> {
		// controller: this connects the fragment's press handlers (docs/09, M16).
		if (!this.oEditDialog) {
			this.oEditDialog = (await Fragment.load({
				name: "learn.fcl.view.EditStatusDialog",
				id: this.getView()?.getId(),
				controller: this
			})) as Dialog;
			this.getView()?.addDependent(this.oEditDialog);
		}

		// Prefill from the Detail view's binding context.
		const oContext = this.getView()?.getBindingContext();
		if (!oContext) {
			MessageBox.information("No order selected");
			return;
		}
		(this.byId("editStatusSelect") as unknown as Select).setSelectedKey(
			String(oContext.getProperty("Status")));
		this.oEditDialog.open();
	}

	public onCancelEdit(): void {
		this.oEditDialog?.close();
	}

	public onSaveEdit(): void {
		const oContext = this.getView()?.getBindingContext();
		const sNewStatus = String((this.byId("editStatusSelect") as unknown as Select).getSelectedKey());
		if (!oContext || !sNewStatus) {
			return;
		}

		// V4 update: setProperty on the CONTEXT sends the PATCH - the row's
		// bindings update themselves (no refresh, no model.update). The cast
		// covers the typings gap for Context.setProperty in 1.152.
		(oContext as unknown as { setProperty(sPath: string, oValue: unknown): void })
			.setProperty("Status", sNewStatus);
		this.oEditDialog?.close();
	}
}
