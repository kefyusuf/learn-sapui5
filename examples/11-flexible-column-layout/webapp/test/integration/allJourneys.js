/* Loads the journeys, then hands control to QUnit.
 * The V4 mock is SERVER middleware (ui5.yaml) - nothing to boot here. */
QUnit.config.autostart = false;

sap.ui.require([
	"learn/fcl/test/integration/FclJourney"
], function () {
	"use strict";
	QUnit.start();
});
