/* Loads the journeys, then hands control to QUnit.
 * The V4 mock is SERVER middleware (ui5.yaml) - nothing to boot here. */
QUnit.config.autostart = false;

sap.ui.require([
	"learn/v4messages/test/integration/MessagesJourneys"
], function () {
	"use strict";
	QUnit.start();
});
