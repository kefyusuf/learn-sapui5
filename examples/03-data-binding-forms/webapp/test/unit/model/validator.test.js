/* RED: the validator module exists as a stub - these tests define the
   behavior we want before implementing it (see docs/12-testing-tdd.md). */
sap.ui.define(["learn/databinding/model/validator"], function (validator) {
	"use strict";

	QUnit.module("validator.isValidEmail");

	QUnit.test("accepts a minimal valid email", function (assert) {
		assert.strictEqual(validator.isValidEmail("a@b.co"), true);
	});

	QUnit.test("accepts typical business addresses", function (assert) {
		assert.strictEqual(validator.isValidEmail("maria.kaya@acme-corp.com.tr"), true);
		assert.strictEqual(validator.isValidEmail("J.WEBER+news@sub.domain.org"), true);
	});

	QUnit.test("rejects empty and missing input", function (assert) {
		assert.strictEqual(validator.isValidEmail(""), false);
		assert.strictEqual(validator.isValidEmail(null), false);
		assert.strictEqual(validator.isValidEmail(undefined), false);
	});

	QUnit.test("rejects strings without a domain part", function (assert) {
		assert.strictEqual(validator.isValidEmail("not-an-email"), false);
		assert.strictEqual(validator.isValidEmail("trailing@"), false);
		assert.strictEqual(validator.isValidEmail("@leading.com"), false);
	});

	QUnit.test("rejects strings without a TLD", function (assert) {
		assert.strictEqual(validator.isValidEmail("user@host"), false);
	});

	QUnit.test("rejects embedded whitespace", function (assert) {
		assert.strictEqual(validator.isValidEmail("a b@c.de"), false);
	});
});
