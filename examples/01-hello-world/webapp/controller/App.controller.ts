import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";
import Input from "sap/m/Input";

/**
 * @namespace learn.helloworld.controller
 *
 * Controllers wire events (press="onSayHello" in the XML view) to logic.
 * this.byId("...") looks up controls declared in this controller's view.
 */
export default class AppController extends Controller {

	public onSayHello(): void {
		const oInput = this.byId("nameInput") as Input;
		const sName = oInput.getValue().trim() || "world";
		MessageToast.show(`Hello, ${sName}!`);
	}
}
