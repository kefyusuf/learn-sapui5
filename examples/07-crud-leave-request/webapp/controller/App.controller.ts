import Controller from "sap/ui/core/mvc/Controller";
import Fragment from "sap/ui/core/Fragment";
import Dialog from "sap/m/Dialog";
import Input from "sap/m/Input";
import DatePicker from "sap/m/DatePicker";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import MessageToast from "sap/m/MessageToast";
import MessageBox from "sap/m/MessageBox";
import Table from "sap/m/Table";
import ListBinding from "sap/ui/model/ListBinding";
import { validateLeaveRequest, calcDays } from "learn/crud/model/validator";

/**
 * @namespace learn.crud.controller
 */
export default class AppController extends Controller {

	private oDialog: Dialog | null = null;
	private oBundle: ResourceBundle | null = null;

	public formatStatusState(sStatus: string): string {
		switch (sStatus) {
			case "Approved": return "Success";
			case "Pending": return "Warning";
			case "Rejected": return "Error";
			default: return "None";
		}
	}

	/**
	 * Joins the typed date parts into one readable period string.
	 */
	public formatPeriod(sStart: string, sEnd: string): string {
		return `${sStart ?? "?"} - ${sEnd ?? "?"}`;
	}

	public onInit(): void {
		// Preload the bundle once - texts used in callbacks stay synchronous.
		// Promise.resolve wraps both cases: synchronous manifest bundles
		// return the bundle directly, async ones return a promise.
		const oI18n = this.getView()?.getModel("i18n") as unknown as {
			getResourceBundle(): Promise<ResourceBundle> | ResourceBundle;
		} | undefined;
		void Promise.resolve(oI18n?.getResourceBundle()).then((oBundle) => {
			this.oBundle = oBundle ?? null;
		});
	}

	private _text(sKey: string, aArgs?: string[]): string {
		return this.oBundle?.getText(sKey, aArgs) ?? sKey;
	}

	public async onNewRequest(): Promise<void> {
		if (!this.oDialog) {
			this.oDialog = (await Fragment.load({
				name: "learn.crud.view.LeaveRequestDialog",
				id: this.getView()?.getId()
			})) as Dialog;
			this.getView()?.addDependent(this.oDialog);
		}
		(this.byId("employeeInput") as unknown as Input)?.setValue("");
		(this.byId("noteArea") as unknown as { setValue(v: string): void })?.setValue("");
		this.oDialog.open();
	}

	public onCancelRequest(): void {
		this.oDialog?.close();
	}

	public onSubmitRequest(): void {
		const oEmployee = this.byId("employeeInput") as unknown as Input;
		const oStart = this.byId("startPicker") as unknown as DatePicker;
		const oEnd = this.byId("endPicker") as unknown as DatePicker;
		const oNote = this.byId("noteArea") as unknown as { getValue(): string };

		const sStart = oStart.getValue();
		const sEnd = oEnd.getValue();

		// Client-side validation BEFORE the server round trip - all rules
		// live in the tested validator module, the controller stays thin.
		const sErrorKey = validateLeaveRequest({
			employee: oEmployee.getValue(),
			startDate: sStart,
			endDate: sEnd
		});
		if (sErrorKey) {
			MessageBox.error(this._text(sErrorKey));
			return;
		}

		const oModel = this.getView()?.getModel() as ODataModel;
		oModel.create(
			"/LeaveRequestSet",
			{
				ID: "", // the mock server assigns the key
				Employee: oEmployee.getValue().trim(),
				Type: (this.byId("typeSelect") as unknown as { getSelectedKey(): string }).getSelectedKey(),
				StartDate: `/Date(${new Date(sStart).getTime()})/`,
				EndDate: `/Date(${new Date(sEnd).getTime()})/`,
				Days: calcDays(sStart, sEnd),
				Status: "Pending",
				Note: oNote.getValue()
			},
			{
				success: () => {
					// Refresh the list binding so the new row appears.
					const oTable = this.byId("requestsTable") as Table;
					(oTable.getBinding("items") as ListBinding).refresh();
					this.oDialog?.close();
					MessageToast.show(this._text("created.message", [oEmployee.getValue().trim()]));
				},
				error: (oError: { message?: string }) => {
					MessageBox.error(oError.message ?? "Create failed");
				}
			}
		);
	}

	public onDeleteRequest(): void {
		const oTable = this.byId("requestsTable") as Table;
		const oContext = oTable.getSelectedItem()?.getBindingContext();
		if (!oContext) {
			return;
		}
		const sID = oContext.getProperty("ID") as string;
		const sEmployee = oContext.getProperty("Employee") as string;

		MessageBox.confirm(this._text("delete.confirm.text", [sID, sEmployee]), {
			title: this._text("delete.confirm.title"),
			onClose: (sAction: string | null) => {
				if (sAction !== MessageBox.Action.OK) {
					return;
				}
				const oModel = this.getView()?.getModel() as ODataModel;
				oModel.remove(oContext.getPath(), {
					success: () => {
						(oTable.getBinding("items") as ListBinding).refresh();
						MessageToast.show(this._text("deleted.message"));
					},
					error: (oError: { message?: string }) => {
						MessageBox.error(oError.message ?? "Delete failed");
					}
				});
			}
		});
	}
}
