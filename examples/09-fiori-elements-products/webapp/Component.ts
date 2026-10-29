import AppComponent from "sap/fe/core/AppComponent";

/**
 * @namespace learn.feproducts
 *
 * Fiori Elements apps extend sap.fe.core.AppComponent. There is almost
 * no application code: the List Report and Object Page templates read
 * their configuration from the manifest and the OData annotations.
 */
export default class Component extends AppComponent {

	public static metadata = {
		manifest: "json"
	};
}
