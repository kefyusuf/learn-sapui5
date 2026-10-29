/**
 * Input validation for example 03 - pure functions, unit-tested in
 * webapp/test/unit/model/validator.test.js.
 */

const EMAIL_PATTERN = /^[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

/**
 * Pragmatic email check: one non-empty local part, exactly the usual
 * dot-separated domain structure and a TLD of at least two letters.
 * Not RFC 5322 complete - deliberately readable.
 */
export function isValidEmail(sEmail: string): boolean {
	if (typeof sEmail !== "string") {
		return false;
	}
	const sTrimmed = sEmail.trim();
	if (!sTrimmed || /\s/.test(sTrimmed)) {
		return false;
	}
	return EMAIL_PATTERN.test(sTrimmed);
}
