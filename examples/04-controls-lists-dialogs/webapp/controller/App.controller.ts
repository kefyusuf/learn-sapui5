import Controller from "sap/ui/core/mvc/Controller";
import Fragment from "sap/ui/core/Fragment";
import Dialog from "sap/m/Dialog";
import Input from "sap/m/Input";
import CheckBox from "sap/m/CheckBox";
import SearchField from "sap/m/SearchField";
import List from "sap/m/List";
import ListBinding from "sap/ui/model/ListBinding";
import Filter from "sap/ui/model/Filter";
import JSONModel from "sap/ui/model/json/JSONModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import MessageToast from "sap/m/MessageToast";
import MessageBox from "sap/m/MessageBox";
import ListItemBase from "sap/m/ListItemBase";
import { formatter } from "learn/controls/model/formatter";

interface Product {
	name: string;
	category: string;
	price: number;
	stock: number;
}

/**
 * @namespace learn.controls.controller
 */
export default class AppController extends Controller {

	private oDialog: Dialog | null = null;

	/**
	 * Thin adapters for XML bindings: a leading "." in a formatter string
	 * resolves to a method on this controller, which delegates to the pure
	 * formatting module. (Module path strings in bindings need `core:require`
	 * - see docs/07-typescript-in-ui5.md.)
	 */
	public formatPrice(nPrice: number): string {
		return formatter.formatPrice(nPrice);
	}

	public formatStock(nStock: number): string {
		return formatter.formatStock(nStock);
	}

	public formatStockState(nStock: number): string {
		return formatter.formatStockState(nStock);
	}

	public onInit(): void {
		this.getView()?.setModel(new JSONModel({
			products: [
				{ name: "Laser Mouse Pro", category: "Peripherals", price: 129.5, stock: 12 },
				{ name: "Ergo Keyboard XL", category: "Peripherals", price: 89, stock: 3 },
				{ name: "27\" 4K Monitor", category: "Displays", price: 449, stock: 7 },
				{ name: "USB-C Dock", category: "Peripherals", price: 159.9, stock: 0 },
				{ name: "Noise-Cancel Headset", category: "Audio", price: 219, stock: 4 },
				{ name: "Conference Speaker", category: "Audio", price: 299, stock: 2 },
				{ name: "Webcam FHD+", category: "Video", price: 79.9, stock: 18 },
				{ name: "Standing Desk Mat", category: "Furniture", price: 59, stock: 9 },
				{ name: "Laptop Stand Alu", category: "Furniture", price: 45, stock: 0 },
				{ name: "Cable Organizer Set", category: "Accessories", price: 12.5, stock: 40 },
				{ name: "External SSD 1TB", category: "Storage", price: 129, stock: 5 },
				{ name: "Trackball Classic", category: "Peripherals", price: 69, stock: 1 }
			] as Product[]
		}));
	}

	public onSearch(oEvent: { getSource(): unknown }): void {
		const sQuery = (oEvent.getSource() as SearchField).getValue();
		// Filter the *binding*, not the model data. The list re-renders
		// automatically - never rebuild the model on search.
		const oList = this.byId("productList") as List;
		const oBinding = oList.getBinding("items") as ListBinding | undefined;
		oBinding?.filter(new Filter("name", "Contains", sQuery));
	}

	public onProductPressed(oEvent: { getSource(): unknown }): void {
		const oItem = oEvent.getSource() as ListItemBase;
		const oProduct = oItem.getBindingContext()?.getObject() as Product | undefined;
		MessageToast.show(oProduct ? `${oProduct.name} - ${oProduct.price} EUR` : "");
	}

	public async onAddProduct(): Promise<void> {
		// Fragments are loaded once and reused; we remember the instance.
		if (!this.oDialog) {
			this.oDialog = (await Fragment.load({
				name: "learn.controls.view.ProductDialog",
				id: this.getView()?.getId()
			})) as Dialog;
			this.getView()?.addDependent(this.oDialog);
		}
		this.oDialog.open();
	}

	public onCancelProduct(): void {
		this.oDialog?.close();
	}

	public async onSaveProduct(): Promise<void> {
		const oName = this.byId("nameInput") as unknown as Input;
		const oPrice = this.byId("priceInput") as unknown as Input;
		const oStock = this.byId("stockInput") as unknown as CheckBox;
		if (!oName || !oPrice || !oStock) {
			return;
		}

		const sName = oName.getValue().trim();
		const nPrice = Number(oPrice.getValue());
		// Validation with VISIBLE feedback - a silent `return` left users
		// staring at an unresponsive button (fixed test-first, docs/12).
		const oBundle = await (this.getView()?.getModel("i18n") as unknown as {
			getResourceBundle(): Promise<ResourceBundle>;
		}).getResourceBundle();
		if (!sName) {
			MessageBox.error(oBundle.getText("error.name") ?? "");
			return;
		}
		if (!(nPrice > 0)) {
			MessageBox.error(oBundle.getText("error.price") ?? "");
			return;
		}

		const oModel = this.getView()?.getModel() as JSONModel;
		const aProducts = oModel.getProperty("/products") as Product[];

		aProducts.unshift({
			name: sName,
			category: "New",
			price: nPrice,
			stock: oStock.getSelected() ? 10 : 0
		});
		// Refresh only after the data changed - the list updates itself.
		oModel.refresh();

		this.oDialog?.close();
		oName.setValue("");
		oPrice.setValue("");
		MessageToast.show(oBundle.getText("added.message", [sName]) ?? "");
	}
}
