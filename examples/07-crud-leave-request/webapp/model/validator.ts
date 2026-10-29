/**
 * Leave-request input validation - pure functions, unit-tested in
 * webapp/test/unit/model/validator.test.js.
 *
 * validateLeaveRequest returns an i18n key on error, null on success, so
 * the controller stays thin and every rule is testable without UI5.
 */

export interface LeaveRequestInput {
	employee: string;
	startDate: string;
	endDate: string;
}

/**
 * Returns null when the input is valid, otherwise an i18n key
 * ("error.employee" | "error.missingDates" | "error.endBeforeStart").
 */
export function validateLeaveRequest(oInput: LeaveRequestInput): string | null {
	if (typeof oInput?.employee !== "string" || !oInput.employee.trim()) {
		return "error.employee";
	}
	if (!oInput.startDate || !oInput.endDate) {
		// Missing dates would otherwise flow into calcDays and produce NaN.
		return "error.missingDates";
	}
	if (oInput.endDate < oInput.startDate) {
		// "yyyy-MM-dd" strings compare correctly as plain strings.
		return "error.endBeforeStart";
	}
	return null;
}

/**
 * Inclusive number of days between two "yyyy-MM-dd" strings.
 * Date-only strings are parsed as UTC midnight, so the arithmetic is
 * timezone-safe.
 */
export function calcDays(sStart: string, sEnd: string): number {
	return Math.round((new Date(sEnd).getTime() - new Date(sStart).getTime()) / 86400000) + 1;
}
