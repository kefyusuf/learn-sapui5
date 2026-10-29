import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import MessageToast from "sap/m/MessageToast";
import MessageBox from "sap/m/MessageBox";
import { formatter } from "learn/databinding/model/formatter";
import { isValidEmail } from "learn/databinding/model/validator";

const INITIAL_CUSTOMER = {
	name: "",
	email: "",
	phone: "0555112233",
	revenue: 1200000,
	vatRegistered: true
};

/**
 * @namespace learn.databinding.controller
 */
export default class AppController extends Controller {

	public onInit(): void {
		this.getView()?.setModel(new JSONModel({ customer: INITIAL_CUSTOMER }));
	}

	/**
	 * Thin adapters for XML bindings: in XML views a leading "." in a
	 * formatter string resolves to a method on *this controller*, so we
	 * delegate to the pure formatting module. (Using a module path string
	 * directly is only possible with `core:require` - see docs/07.)
	 */
	public formatPhone(sPhone: string): string {
		return formatter.formatPhone(sPhone);
	}

	public formatRevenue(nRevenue: number): string {
		return formatter.formatRevenue(nRevenue);
	}

	/**
	 * Formatter used by the summary bar. `parts` in the binding feed the
	 * arguments - this is a multi-part binding.
	 */
	public formatSummary(sName: string, sEmail: string): string {
		const oBundle = (this.getView()?.getModel("i18n") as unknown as {
			getResourceBundle(): Promise<ResourceBundle>;
		});
		if (!oBundle) {
			return "";
		}
		const sWho = sName || "(new customer)";
		return `${sWho} - ${sEmail || "no email yet"}`;
	}

	public async onSave(): Promise<void> {
		const oView = this.getView();
		if (!oView) {
			return;
		}
		// Two-way binding: the model already holds what the user typed.
		const oModel = oView.getModel() as JSONModel;
		const sName = (oModel.getProperty("/customer/name") as string) ?? "";
		const sEmail = (oModel.getProperty("/customer/email") as string) ?? "";

		// Server-side checks are not enough - validate before the round trip.
		if (!isValidEmail(sEmail)) {
			MessageBox.error((await this._bundle()).getText("error.invalidEmail") ?? "");
			return;
		}

		const oBundle = await this._bundle();
		MessageToast.show(oBundle.getText("saved.message", [sName, sEmail]) ?? "");
	}

	public onReset(): void {
		// Model -> UI direction: setData updates every bound control.
		(this.getView()?.getModel() as JSONModel).setData({ customer: INITIAL_CUSTOMER });
	}

	private async _bundle(): Promise<ResourceBundle> {
		const oI18n = this.getView()?.getModel("i18n") as unknown as {
			getResourceBundle(): Promise<ResourceBundle> | ResourceBundle;
		} | undefined;
		if (!oI18n) {
			throw new Error("i18n model missing on view");
		}
		return Promise.resolve(oI18n.getResourceBundle());
	}
}
