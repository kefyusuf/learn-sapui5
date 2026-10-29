import UIComponent from "sap/ui/core/UIComponent";

/**
 * @namespace learn.odata
 *
 * Note: the mock server is started in index.html BEFORE this component
 * is created. Deferring super.init() here would break the component
 * lifecycle (docs/09, M08) - keep init() synchronous.
 */
export default class Component extends UIComponent {

	public static metadata = {
		manifest: "json"
	};

	public init(): void {
		super.init();
	}
}
