/* Loads all unit test modules, then hands control to QUnit. */
QUnit.config.autostart = false;

sap.ui.require([
	"learn/controls/test/unit/model/formatter.test",
	"learn/controls/test/unit/controller/App.test"
], function () {
	"use strict";
	QUnit.start();
});
