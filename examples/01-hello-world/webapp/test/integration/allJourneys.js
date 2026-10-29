/* Loads the journeys, then hands control to QUnit. */
QUnit.config.autostart = false;

sap.ui.require([
	"learn/helloworld/test/integration/SmokeJourney"
], function () {
	"use strict";
	QUnit.start();
});
