const oNumberFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 });

export const formatter = {

	formatPrice(nPrice: string | number): string {
		return oNumberFormat.format(Number(nPrice ?? 0));
	},

	/**
	 * Boolean -> the UI5 state type used by ObjectStatus.
	 */
	formatStockState(nStock: number, bDiscontinued: boolean): string {
		if (bDiscontinued) {
			return "None";
		}
		if (nStock <= 0) {
			return "Error";
		}
		if (nStock < 20) {
			return "Warning";
		}
		return "Success";
	},

	formatStockText(nStock: number, bDiscontinued: boolean): string {
		if (bDiscontinued) {
			return "Discontinued";
		}
		if (nStock <= 0) {
			return "Out of stock";
		}
		if (nStock < 20) {
			return "Low stock";
		}
		return "Available";
	}
};
