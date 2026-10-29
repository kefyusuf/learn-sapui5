/* Loads the journeys, then hands control to QUnit. */
QUnit.config.autostart = false;

sap.ui.require([
	"learn/routing/test/integration/NavigationJourney"
], function () {
	"use strict";
	QUnit.start();
});
