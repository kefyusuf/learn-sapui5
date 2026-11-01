import Controller from "sap/ui/core/mvc/Controller";
import { formatter } from "learn/fcl/model/formatter";

/**
 * @namespace learn.fcl.controller
 *
 * The navigation is driven by the App controller (the FCL-without-routing
 * pattern) - this controller only provides the formatters.
 */
export default class DetailController extends Controller {

	// Formatter adapters for the XML view (leading "." resolves here).
	public formatTotal(nTotal: string | number): string {
		return formatter.formatTotal(nTotal);
	}
}
