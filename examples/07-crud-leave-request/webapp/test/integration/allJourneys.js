/* Unlike the app's index.html, an OPA5 page does not run the index boot
   chain - so the mock server has to be started HERE, before the journeys
   boot the component and its OData model fires $metadata (docs/09, M08). */
QUnit.config.autostart = false;

sap.ui.require(["learn/crud/util/mockserver"], function (mockserver) {
	"use strict";
	mockserver.startMockServer().then(function () {
		sap.ui.require([
			"learn/crud/test/integration/CreateRequestJourney",
			"learn/crud/test/integration/DeleteJourney"
		], function () {
			QUnit.start();
		});
	});
});
