sap.ui.define(["learn/realodata/model/formatter"], function (oModule) {
	"use strict";

	const formatter = oModule.formatter;

	QUnit.module("formatter.formatPrice");

	QUnit.test("formats OData string decimals with two decimals", function (assert) {
		assert.strictEqual(formatter.formatPrice("129.5"), "129.50");
		assert.strictEqual(formatter.formatPrice(449), "449.00");
	});

	QUnit.test("falls back to 0.00 for missing input", function (assert) {
		assert.strictEqual(formatter.formatPrice(undefined), "0.00");
	});

	QUnit.module("formatter.formatStockState");

	QUnit.test("discontinued wins over every stock level", function (assert) {
		assert.strictEqual(formatter.formatStockState(0, true), "None");
		assert.strictEqual(formatter.formatStockState(100, true), "None");
	});

	QUnit.test("maps stock levels to ObjectStatus states", function (assert) {
		assert.strictEqual(formatter.formatStockState(0, false), "Error");
		assert.strictEqual(formatter.formatStockState(19, false), "Warning");
		assert.strictEqual(formatter.formatStockState(20, false), "Success");
	});

	QUnit.module("formatter.formatStockText");

	QUnit.test("maps stock levels to readable text", function (assert) {
		assert.strictEqual(formatter.formatStockText(0, true), "Discontinued");
		assert.strictEqual(formatter.formatStockText(0, false), "Out of stock");
		assert.strictEqual(formatter.formatStockText(5, false), "Low stock");
		assert.strictEqual(formatter.formatStockText(25, false), "Available");
	});
});
