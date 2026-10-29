import UIComponent from "sap/ui/core/UIComponent";

/**
 * @namespace learn.helloworld
 *
 * The component is the application's entry object. It owns the manifest
 * (metadata: "json") and therefore the rootView, models and libraries
 * declared there. Keep it small - logic belongs in controllers.
 */
export default class Component extends UIComponent {

	public static metadata = {
		manifest: "json"
	};

	public init(): void {
		super.init();
	}
}
