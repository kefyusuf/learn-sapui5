import Controller from "sap/ui/core/mvc/Controller";
import SearchField from "sap/m/SearchField";
import Table from "sap/m/Table";
import ListBinding from "sap/ui/model/ListBinding";
import Filter from "sap/ui/model/Filter";
import { formatter } from "learn/realodata/model/formatter";

/**
 * @namespace learn.realodata.controller
 */
export default class AppController extends Controller {

	// Formatter adapters for the XML view (leading "." resolves here).
	public formatPrice(nPrice: string | number): string {
		return formatter.formatPrice(nPrice);
	}

	public formatStockState(nStock: number, bDiscontinued: boolean): string {
		return formatter.formatStockState(nStock, bDiscontinued);
	}

	public formatStockText(nStock: number, bDiscontinued: boolean): string {
		return formatter.formatStockText(nStock, bDiscontinued);
	}

	public onSearch(oEvent: { getSource(): unknown }): void {
		const sQuery = (oEvent.getSource() as SearchField).getValue();
		// Client-side Contains filter on the data already fetched -
		// server-side $filter would be the production choice (see README).
		const oTable = this.byId("productsTable") as Table;
		const oBinding = oTable.getBinding("items") as ListBinding | undefined;
		oBinding?.filter(new Filter("ProductName", "Contains", sQuery));
	}
}
