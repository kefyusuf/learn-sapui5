sap.ui.define(["learn/databinding/model/formatter"], function (oFormatterModule) {
	"use strict";

	// The module is ESM source with a named export: after transpilation the
	// AMD factory returns { formatter: {...} } - destructure it (docs/12).
	const formatter = oFormatterModule.formatter;

	QUnit.module("formatter.formatPhone", {
		beforeEach: function () {
			this.oFormatter = formatter;
		}
	});

	QUnit.test("groups a 10-digit phone number", function (assert) {
		assert.strictEqual(this.oFormatter.formatPhone("0555112233"), "0555 112 233");
	});

	QUnit.test("returns empty string for empty input", function (assert) {
		assert.strictEqual(this.oFormatter.formatPhone(""), "");
		assert.strictEqual(this.oFormatter.formatPhone(null), "");
	});

	QUnit.test("passes through numbers of unexpected length", function (assert) {
		assert.strictEqual(this.oFormatter.formatPhone("055511223"), "055511223");
		assert.strictEqual(this.oFormatter.formatPhone("055511223344"), "055511223344");
	});

	QUnit.test("strips non-digit characters before grouping", function (assert) {
		assert.strictEqual(this.oFormatter.formatPhone("0555-112-233"), "0555 112 233");
	});

	QUnit.module("formatter.formatRevenue");

	QUnit.test("formats thousands with grouping and currency", function (assert) {
		assert.strictEqual(formatter.formatRevenue(1200000), "1,200,000 EUR");
	});

	QUnit.test("returns empty string for non-number input", function (assert) {
		assert.strictEqual(formatter.formatRevenue(undefined), "");
		assert.strictEqual(formatter.formatRevenue(null), "");
	});

	QUnit.module("formatter.formatVatState");

	QUnit.test("maps VAT state to ObjectStatus values", function (assert) {
		assert.strictEqual(formatter.formatVatState(true), "Success");
		assert.strictEqual(formatter.formatVatState(false), "Warning");
	});
});
