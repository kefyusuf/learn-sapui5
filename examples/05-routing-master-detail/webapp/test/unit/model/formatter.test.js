/* RED: the formatter module is being EXTRACTED from the Master/Detail
   controllers - these tests define its contract before the move
   (TDD, docs/12-testing-tdd.md). */
sap.ui.define(["learn/routing/model/formatter"], function (oModule) {
	"use strict";

	const formatter = oModule.formatter;

	QUnit.module("formatter.formatStatus");

	QUnit.test("maps order statuses to ObjectStatus states", function (assert) {
		assert.strictEqual(formatter.formatStatus("Shipped"), "Success");
		assert.strictEqual(formatter.formatStatus("Processing"), "Warning");
		assert.strictEqual(formatter.formatStatus("Open"), "None");
		assert.strictEqual(formatter.formatStatus("Nonsense"), "None");
	});

	QUnit.module("formatter.formatTotal");

	QUnit.test("formats totals with two decimals", function (assert) {
		assert.strictEqual(formatter.formatTotal(4820), "4,820.00");
		assert.strictEqual(formatter.formatTotal(1533.9), "1,533.90");
	});

	QUnit.test("returns empty string for non-number input", function (assert) {
		assert.strictEqual(formatter.formatTotal(undefined), "");
		assert.strictEqual(formatter.formatTotal(null), "");
	});
});
