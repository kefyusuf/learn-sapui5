/* Loads the journeys, then hands control to QUnit.
 * The V2 MockServer is an IN-APP construct (index.html boots it) - an OPA
 * page does not run the app's index.html chain, so the mock must start
 * HERE, before the component boot (docs/09 M08 + docs/12). */
QUnit.config.autostart = false;

sap.ui.require([
	"learn/smart/util/mockserver",
	"learn/smart/test/integration/SmartJourney"
], function (mockserver) {
	"use strict";
	mockserver.startMockServer().then(function () {
		QUnit.start();
	});
});
