/* Loads the journeys, then hands control to QUnit. */
QUnit.config.autostart = false;

sap.ui.require([
	"learn/databinding/test/integration/FlowJourney"
], function () {
	"use strict";
	QUnit.start();
});
