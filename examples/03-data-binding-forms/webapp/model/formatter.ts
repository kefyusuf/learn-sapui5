/**
 * Pure formatting functions for bindings in example 03.
 *
 * Formatters never touch the model - they receive bound values and return
 * display strings. Keeping them in a separate module makes them reusable
 * and unit-testable (see webapp/test/unit/model/formatter.test.js).
 */
const oNumberFormat = new Intl.NumberFormat("en-US", {
	useGrouping: true
});

export const formatter = {

	/**
	 * Groups a 10-digit phone number as "0555 112 233" (4-3-3).
	 * Input of any other digit length is passed through unchanged.
	 */
	formatPhone(sPhone: string): string {
		if (!sPhone) {
			return "";
		}
		const sDigits = sPhone.replace(/\D/g, "");
		if (sDigits.length !== 10) {
			return sPhone;
		}
		return `${sDigits.slice(0, 4)} ${sDigits.slice(4, 7)} ${sDigits.slice(7, 10)}`;
	},

	/**
	 * 1200000 -> "1,200,000 EUR"
	 */
	formatRevenue(nRevenue: number): string {
		if (typeof nRevenue !== "number") {
			return "";
		}
		return `${oNumberFormat.format(nRevenue)} EUR`;
	},

	/**
	 * Maps the VAT flag to an ObjectStatus state.
	 */
	formatVatState(bVat: boolean): string {
		return bVat ? "Success" : "Warning";
	}
};
