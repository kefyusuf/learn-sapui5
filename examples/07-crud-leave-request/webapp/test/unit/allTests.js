/* Loads all unit test modules, then hands control to QUnit. */
QUnit.config.autostart = false;

sap.ui.require([
	"learn/crud/test/unit/model/validator.test",
	"learn/crud/test/unit/controller/App.test"
], function () {
	"use strict";
	QUnit.start();
});
