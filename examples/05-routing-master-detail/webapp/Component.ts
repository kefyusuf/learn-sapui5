import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace learn.routing
 *
 * The component owns the shared model (both master and detail read it)
 * and starts the router - the manifest's routing config describes the
 * navigation graph, the router turns it into views.
 */
export default class Component extends UIComponent {

	public static metadata = {
		manifest: "json"
	};

	public init(): void {
		super.init();

		this.setModel(new JSONModel({
			orders: [
				{
					id: "SO-1001",
					customer: "Acme Industries Ltd.",
					date: "2026-10-12",
					status: "Shipped",
					total: 4820,
					items: [
						{ product: "Laser Mouse Pro", quantity: 10, price: 129.5 },
						{ product: "Ergo Keyboard XL", quantity: 20, price: 89 },
						{ product: "External SSD 1TB", quantity: 10, price: 129 }
					]
				},
				{
					id: "SO-1002",
					customer: "Borealis Retail Group",
					date: "2026-10-18",
					status: "Processing",
					total: 898,
					items: [
						{ product: "27\" 4K Monitor", quantity: 2, price: 449 }
					]
				},
				{
					id: "SO-1003",
					customer: "Delta Logistics",
					date: "2026-10-21",
					status: "Open",
					total: 1533.9,
					items: [
						{ product: "Webcam FHD+", quantity: 15, price: 79.9 },
						{ product: "Cable Organizer Set", quantity: 24, price: 12.5 }
					]
				}
			]
		}));

		// Router initialization - without this call the first view never loads.
		this.getRouter().initialize();
	}
}
