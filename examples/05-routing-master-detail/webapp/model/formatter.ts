/**
 * Formatting functions for the sales order master-detail app.
 * Extracted from the Master/Detail controllers test-first: the unit
 * tests in webapp/test/unit/model/formatter.test.js define the contract.
 */
const oNumberFormat = new Intl.NumberFormat("en-US", {
	minimumFractionDigits: 2
});

export const formatter = {

	/**
	 * Maps an order status to the ObjectStatus state type.
	 */
	formatStatus(sStatus: string): string {
		switch (sStatus) {
			case "Shipped": return "Success";
			case "Processing": return "Warning";
			default: return "None";
		}
	},

	/**
	 * 4820 -> "4,820.00"; anything but a number renders as empty.
	 */
	formatTotal(nTotal: number): string {
		return typeof nTotal === "number" ? oNumberFormat.format(nTotal) : "";
	}
};
