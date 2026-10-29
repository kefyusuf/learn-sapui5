/* Loads all unit test modules, then hands control to QUnit. */
QUnit.config.autostart = false;

sap.ui.require([
	"learn/odata/test/unit/model/formatter.test"
], function () {
	"use strict";
	QUnit.start();
});
