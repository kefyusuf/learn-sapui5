/* Loads the journeys, then hands control to QUnit. */
QUnit.config.autostart = false;

sap.ui.require([
	"learn/controls/test/integration/AddProductJourney"
], function () {
	"use strict";
	QUnit.start();
});
