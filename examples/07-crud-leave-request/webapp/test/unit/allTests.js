/* Loads all unit test modules, then hands control to QUnit. */
QUnit.config.autostart = false;

sap.ui.require([
	"learn/crud/test/unit/model/validator.test"
], function () {
	"use strict";
	QUnit.start();
});
