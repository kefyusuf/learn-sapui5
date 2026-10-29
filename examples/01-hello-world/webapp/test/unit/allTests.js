/* Loads all unit test modules, then hands control to QUnit. */
QUnit.config.autostart = false;

sap.ui.require([
	"learn/helloworld/test/unit/controller/App.test"
], function () {
	"use strict";
	QUnit.start();
});
