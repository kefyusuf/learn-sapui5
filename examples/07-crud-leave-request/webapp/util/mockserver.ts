import MockServer from "sap/ui/core/util/MockServer";
import Log from "sap/base/Log";

let bStarted = false;

/**
 * Same pattern as example 06: intercept all OData requests locally.
 * The MockServer also SIMULATES WRITES: POST (create) and DELETE are
 * applied to the in-memory data - full CRUD without a backend.
 */
export async function startMockServer(): Promise<void> {
	if (bStarted) {
		return;
	}
	bStarted = true;

	const oMockServer = new MockServer({
		rootUri: "/sap/opu/odata/sap/ZLEAVEREQUEST_SRV/"
	});
	MockServer.config({
		autoRespond: true,
		autoRespondAfter: 250
	});
	await oMockServer.simulate(
		sap.ui.require.toUrl("learn/crud/localService/metadata.xml"),
		{
			sMockdataBaseUrl: sap.ui.require.toUrl("learn/crud/localService/data/"),
			bGenerateMissingMockData: true
		}
	);
	oMockServer.start();
	Log.info("Mock server started on " + oMockServer.getRootUri());
}
