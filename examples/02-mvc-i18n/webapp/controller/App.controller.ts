import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import MessageToast from "sap/m/MessageToast";

/**
 * @namespace learn.mvc.controller
 */
export default class AppController extends Controller {

	public onInit(): void {
		// The employee data would come from a backend in a real app;
		// here it is a plain JSON model bound by path ({/employee/...}).
		const oData = {
			employee: {
				name: "Maria Kaya",
				department: "Finance",
				role: "Accounts Payable Specialist",
				startDate: "2021-04-12"
			}
		};
		this.getView()?.setModel(new JSONModel(oData));
	}

	public async onSayHi(): Promise<void> {
		const oView = this.getView();
		if (!oView) {
			return;
		}
		const oModel = oView.getModel() as JSONModel;
		const sName = (oModel.getProperty("/employee/name") as string) ?? "";
		const oBundle = await (oView.getModel("i18n") as unknown as { getResourceBundle(): Promise<ResourceBundle> })
			.getResourceBundle();
		MessageToast.show(oBundle.getText("greeting.message", [sName]) ?? "");
	}
}
