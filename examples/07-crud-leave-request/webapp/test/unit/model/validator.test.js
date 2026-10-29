/* RED: the validator module exists as a stub - these tests define the
   contract before implementation (TDD, docs/12-testing-tdd.md). */
sap.ui.define(["learn/crud/model/validator"], function (validator) {
	"use strict";

	// After transpilation the AMD factory returns { validateLeaveRequest, calcDays }
	const mValidator = validator;

	QUnit.module("validator.validateLeaveRequest");

	QUnit.test("accepts a valid request", function (assert) {
		assert.strictEqual(
			mValidator.validateLeaveRequest({ employee: "Maria Kaya", startDate: "2026-11-02", endDate: "2026-11-06" }),
			null
		);
	});

	QUnit.test("rejects an empty employee", function (assert) {
		assert.strictEqual(
			mValidator.validateLeaveRequest({ employee: "", startDate: "2026-11-02", endDate: "2026-11-06" }),
			"error.employee"
		);
		assert.strictEqual(
			mValidator.validateLeaveRequest({ employee: "   ", startDate: "2026-11-02", endDate: "2026-11-06" }),
			"error.employee"
		);
	});

	QUnit.test("rejects missing dates (they would produce NaN days)", function (assert) {
		assert.strictEqual(
			mValidator.validateLeaveRequest({ employee: "Maria Kaya", startDate: "", endDate: "2026-11-06" }),
			"error.missingDates"
		);
		assert.strictEqual(
			mValidator.validateLeaveRequest({ employee: "Maria Kaya", startDate: "2026-11-02", endDate: "" }),
			"error.missingDates"
		);
	});

	QUnit.test("rejects an end date before the start date", function (assert) {
		assert.strictEqual(
			mValidator.validateLeaveRequest({ employee: "Maria Kaya", startDate: "2026-11-06", endDate: "2026-11-02" }),
			"error.endBeforeStart"
		);
	});

	QUnit.test("accepts a single-day request", function (assert) {
		assert.strictEqual(
			mValidator.validateLeaveRequest({ employee: "Maria Kaya", startDate: "2026-11-02", endDate: "2026-11-02" }),
			null
		);
	});

	QUnit.module("validator.calcDays");

	QUnit.test("counts the range inclusively", function (assert) {
		assert.strictEqual(mValidator.calcDays("2026-11-02", "2026-11-06"), 5);
		assert.strictEqual(mValidator.calcDays("2026-11-02", "2026-11-02"), 1);
		assert.strictEqual(mValidator.calcDays("2026-11-30", "2026-12-02"), 3);
	});
});
