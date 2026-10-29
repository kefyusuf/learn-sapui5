/* OPA pages do not run the app's index.html boot chain - so the mock
   server has to be started HERE, before the journeys boot the component
   and its OData model fires $metadata (docs/09, M08). */
QUnit.config.autostart = false;

sap.ui.require(["learn/odata/util/mockserver"], function (mockserver) {
	"use strict";
	mockserver.startMockServer().then(function () {
		sap.ui.require(["learn/odata/test/integration/OrderItemsJourney"], function () {
			QUnit.start();
		});
	});
});
