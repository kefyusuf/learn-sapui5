import MockServer from "sap/ui/core/util/MockServer";
import Log from "sap/base/Log";

let bStarted = false;

/**
 * Starts a local OData V2 mock server that intercepts every request to
 * "/sap/opu/odata/sap/ZSALESORDERS_SRV/" and answers it from the files in
 * webapp/localService - no backend, no network.
 *
 * Returns a promise that resolves once the mock data is loaded. The
 * component MUST wait for it before super.init() creates the manifest
 * models - otherwise the first $metadata request arrives before the
 * mock is ready (see docs/09, M08).
 */
export async function startMockServer(): Promise<void> {
	if (bStarted) {
		return;
	}
	bStarted = true;

	const oMockServer = new MockServer({
		rootUri: "/sap/opu/odata/sap/ZSALESORDERS_SRV/"
	});

	// Simulate a small network latency so spinners are visible -
	// this trains you for real backends.
	MockServer.config({
		autoRespond: true,
		autoRespondAfter: 200
	});

	await oMockServer.simulate(
		sap.ui.require.toUrl("learn/odata/localService/metadata.xml"),
		{
			sMockdataBaseUrl: sap.ui.require.toUrl("learn/odata/localService/data/"),
			bGenerateMissingMockData: true
		}
	);

	oMockServer.start();
	Log.info("Mock server started on " + oMockServer.getRootUri());
}
