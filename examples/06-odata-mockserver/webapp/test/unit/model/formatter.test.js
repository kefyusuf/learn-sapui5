sap.ui.define(["learn/odata/model/formatter"], function (oModule) {
	"use strict";

	const formatter = oModule.formatter;

	QUnit.module("formatter.formatTotal");

	QUnit.test("groups thousands with two decimals", function (assert) {
		assert.strictEqual(formatter.formatTotal("4820.00"), "4,820.00");
		assert.strictEqual(formatter.formatTotal(1533.9), "1,533.90");
	});

	QUnit.test("falls back to 0.00 for missing input", function (assert) {
		assert.strictEqual(formatter.formatTotal(undefined), "0.00");
		assert.strictEqual(formatter.formatTotal(null), "0.00");
	});

	QUnit.module("formatter.formatStatusState");

	QUnit.test("maps order statuses to ObjectStatus states", function (assert) {
		assert.strictEqual(formatter.formatStatusState("Shipped"), "Success");
		assert.strictEqual(formatter.formatStatusState("Processing"), "Warning");
		assert.strictEqual(formatter.formatStatusState("Open"), "None");
		assert.strictEqual(formatter.formatStatusState("Nonsense"), "None");
	});
});
