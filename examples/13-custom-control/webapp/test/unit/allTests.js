/* Loads all unit test modules, then hands control to QUnit. */
QUnit.config.autostart = false;

sap.ui.require([
	"learn/rating/test/unit/control/RatingIndicator.test"
], function () {
	"use strict";
	QUnit.start();
});
