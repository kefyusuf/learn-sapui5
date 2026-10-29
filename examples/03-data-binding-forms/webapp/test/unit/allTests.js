/* Loads all unit test modules, then hands control to QUnit. */
QUnit.config.autostart = false;

sap.ui.require([
	"learn/databinding/test/unit/model/formatter.test",
	"learn/databinding/test/unit/model/validator.test"
], function () {
	"use strict";
	QUnit.start();
});
