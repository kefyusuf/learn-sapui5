/* Loads the journeys, then hands control to QUnit. */
QUnit.config.autostart = false;

sap.ui.require([
	"learn/rating/test/integration/RatingJourney"
], function () {
	"use strict";
	QUnit.start();
});
