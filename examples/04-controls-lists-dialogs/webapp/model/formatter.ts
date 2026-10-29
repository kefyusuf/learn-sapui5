const oCurrencyFormat = new Intl.NumberFormat("en-US", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

export const formatter = {

	/** 129.5 -> "129.50" (numberUnit of ObjectListItem appends the EUR) */
	formatPrice(nPrice: number): string {
		return typeof nPrice === "number" ? oCurrencyFormat.format(nPrice) : "";
	},

	formatStock(nStock: number): string {
		if (nStock <= 0) {
			return "Out of stock";
		}
		if (nStock < 5) {
			return "Low stock";
		}
		return "Available";
	},

	formatStockState(nStock: number): string {
		if (nStock <= 0) {
			return "Error";
		}
		if (nStock < 5) {
			return "Warning";
		}
		return "Success";
	}
};
