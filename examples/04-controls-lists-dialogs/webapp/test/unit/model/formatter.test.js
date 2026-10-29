sap.ui.define(["learn/controls/model/formatter"], function (oModule) {
	"use strict";

	// Named ESM export -> AMD factory returns { formatter: {...} } (docs/12).
	const formatter = oModule.formatter;

	QUnit.module("formatter.formatPrice");

	QUnit.test("formats with exactly two decimals", function (assert) {
		assert.strictEqual(formatter.formatPrice(129.5), "129.50");
		assert.strictEqual(formatter.formatPrice(449), "449.00");
	});

	QUnit.test("returns empty string for missing input", function (assert) {
		assert.strictEqual(formatter.formatPrice(undefined), "");
	});

	QUnit.module("formatter.formatStock");

	QUnit.test("maps stock levels to readable text", function (assert) {
		assert.strictEqual(formatter.formatStock(0), "Out of stock");
		assert.strictEqual(formatter.formatStock(3), "Low stock");
		assert.strictEqual(formatter.formatStock(5), "Available");
		assert.strictEqual(formatter.formatStock(12), "Available");
	});

	QUnit.module("formatter.formatStockState");

	QUnit.test("maps stock levels to ObjectStatus states", function (assert) {
		assert.strictEqual(formatter.formatStockState(0), "Error");
		assert.strictEqual(formatter.formatStockState(3), "Warning");
		assert.strictEqual(formatter.formatStockState(5), "Success");
	});
});
