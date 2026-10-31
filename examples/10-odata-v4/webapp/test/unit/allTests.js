/* Loads all unit test modules, then hands control to QUnit. */
QUnit.config.autostart = false;

sap.ui.require([
	"learn/odatav4/test/unit/model/formatter.test"
], function () {
	"use strict";
	QUnit.start();
});
