/**
 * Pure formatting functions for bindings in example 03.
 *
 * Formatters never touch the model - they receive bound values and return
 * display strings. Keeping them in a separate module makes them reusable
 * and unit-testable.
 */
const oPhoneFormat = new Intl.NumberFormat("en-US", {
	useGrouping: true
});

export const formatter = {

	/**
	 * 0555112233 -> "0555 112 23 33"
	 */
	formatPhone(sPhone: string): string {
		if (!sPhone) {
			return "";
		}
		const sDigits = sPhone.replace(/\D/g, "");
		if (sDigits.length !== 10) {
			return sPhone;
		}
		return `${sDigits.slice(0, 4)} ${sDigits.slice(4, 7)} ${sDigits.slice(7, 9)} ${sDigits.slice(9)}`;
	},

	/**
	 * 1200000 -> "1,200,000 EUR"
	 */
	formatRevenue(nRevenue: number): string {
		if (typeof nRevenue !== "number") {
			return "";
		}
		return `${oPhoneFormat.format(nRevenue)} EUR`;
	},

	/**
	 * Used as a color/state formatter for the status text.
	 */
	formatVatState(bVat: boolean): string {
		return bVat ? "Success" : "Warning";
	}
};
