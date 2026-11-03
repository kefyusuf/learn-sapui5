#!/usr/bin/env node
/* One-off diagnostic: open the example 11 OPA page headless, capture
   every V4 request + console error for 40s, print them. */
import { spawn } from "node:child_process";
import http from "node:http";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = process.argv[2] || "8094";
const PATH_TO_OPEN = process.argv[3] || "/test/integration/opaTests.qunit.html";
const URL_TO_OPEN = `http://localhost:${PORT}${PATH_TO_OPEN}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const profile = mkdtempSync(join(tmpdir(), "diag-"));
const chrome = spawn(
	`"${CHROME}"`,
	[
		"--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run",
		`--user-data-dir="${profile}"`, "--remote-debugging-port=0", "about:blank"
	],
	{ shell: true, stdio: ["ignore", "ignore", "pipe"] }
);

let wsUrl = "";
chrome.stderr.on("data", (c) => {
	const m = /DevTools listening on (ws:\/\/\S+)/.exec(c.toString());
	if (m && !wsUrl) wsUrl = m[1];
});
for (let i = 0; i < 60 && !wsUrl; i++) await sleep(100);
if (!wsUrl) { console.error("no devtools url"); process.exit(1); }

const httpPort = /ws:\/\/127\.0\.0\.1:(\d+)\//.exec(wsUrl)[1];
const list = await new Promise((res) => {
	http.get({ host: "127.0.0.1", port: Number(httpPort), path: "/json/list" }, (r) => {
		let d = ""; r.on("data", (c) => (d += c)); r.on("end", () => res(d));
	});
});
const page = JSON.parse(list).find((t) => t.type === "page");

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

const reqs = [];
const bodies = new Map();
let id = 0;
const send = (method, params = {}) => new Promise((res) => {
	const i = ++id;
	const onMsg = (ev) => {
		const o = JSON.parse(ev.data);
		if (o.id === i) { ws.removeEventListener("message", onMsg); res(o); }
	};
	ws.addEventListener("message", onMsg);
	ws.send(JSON.stringify({ id: i, method, params }));
});

ws.onmessage = (ev) => {
	const o = JSON.parse(ev.data);
	if (o.method === "Network.responseReceived") {
		const r = o.params.response;
		// the V4 requests (the original purpose) plus the page's own
		// scripts - a boot that silently dies is visible there
		if ((r.url.includes("ZSALESORDERSV4") && !r.url.includes("$metadata")) ||
			/\.js(\?|$)/.test(r.url)) {
			reqs.push({ reqId: o.params.requestId, line: `${r.status} ${decodeURIComponent(r.url).slice(0, 180)}` });
		}
	}
	if (o.method === "Log.entryAdded") {
		const e = o.params.entry;
		const t = `${e.level} ${(e.url ?? e.source?.url ?? "").replace(/^https?:\/\/[^/]+/, "")} ${e.text}`.replace(/\s+/g, " ").slice(0, 250);
		if (!/fallback locale/.test(t)) console.log("LOG:", t);
	}
	if (o.method === "Runtime.exceptionThrown") {
		const d = o.params.exceptionDetails;
		const t = `${d.text} ${d.exception?.description ?? ""}`.replace(/\s+/g, " ").slice(0, 300);
		console.log("EXCEPTION:", t);
	}
	if (o.method === "Runtime.consoleAPICalled" &&
		(o.params.type === "error" || o.params.type === "info" || o.params.type === "warning")) {
		const t = o.params.args.map((a) => a.value ?? a.description ?? "").join(" ").replace(/\s+/g, " ").slice(0, 250);
		if (!/fallback locale/.test(t) && !/TEMP items dump/.test(t)) {
			console.log(`CONSOLE(${o.params.type}):`, t);
		}
	}
};

ws.send(JSON.stringify({ id: ++id, method: "Network.enable" }));
ws.send(JSON.stringify({ id: ++id, method: "Runtime.enable" }));
ws.send(JSON.stringify({ id: ++id, method: "Log.enable" }));
ws.send(JSON.stringify({ id: ++id, method: "Page.enable" }));
const oNav = await send("Page.navigate", { url: URL_TO_OPEN }).catch((e) => ({ error: String(e) }));
console.log("NAV:", JSON.stringify(oNav.result ?? oNav).slice(0, 200));

await sleep(45000);

// boot-state probe: what actually happened in the page?
	const oProbe = await send("Runtime.evaluate", {
		expression: `(async () => {
		const oBase = {
			href: location.href,
			innerText: document.body ? document.body.innerText.replace(/\\s+/g, " ").slice(0, 400) : null,
			genericTiles: document.querySelectorAll(".sapMGT").length,
			ui5Loaded: typeof sap !== "undefined",
			container: typeof sap !== "undefined" && typeof sap.ushell !== "undefined" && typeof sap.ushell.Container !== "undefined"
		};
		try {
			if (!oBase.container) { return JSON.stringify(oBase); }
			// the tile component creation is async and SLOW in the shell -
			// poll the DOM for the GenericTile before concluding
			let iWaited = 0;
			while (document.querySelectorAll(".sapMGT").length === 0 && iWaited < 60000) {
				await new Promise((r) => setTimeout(r, 3000));
				iWaited += 3000;
			}
			oBase.genericTiles = document.querySelectorAll(".sapMGT").length;
			oBase.innerText = document.body ? document.body.innerText.replace(/\\s+/g, " ").slice(0, 400) : null;
			return JSON.stringify(oBase);
		} catch (e) { return JSON.stringify(Object.assign(oBase, { launchPageError: String(e) })); }
	})()`,
		returnByValue: true,
		awaitPromise: true
	}).catch(() => null);
console.log("--- boot state ---");
console.log(oProbe?.result?.result?.value ?? "(probe failed)");

console.log("--- V4 requests seen ---");
for (const r of reqs) {
	console.log(r.line);
	const oResp = await send("Network.getResponseBody", { requestId: r.reqId }).catch(() => null);
	if (oResp?.result?.body) {
		let s = oResp.result.body;
		if (oResp.result.base64Encoded) {
			s = Buffer.from(s, "base64").toString("utf8");
		}
		s = s.replace(/\s+/g, " ");
		// the interesting bits: the request line of each batch part and
		// whether a DELETE went through
		const aParts = s.match(/(GET|POST|DELETE|PATCH|MERGE) [^\r\n]+|HTTP\/1\.1 [0-9]{3}[^\r\n]*/g) || [];
		console.log(`   parts: ${aParts.slice(0, 8).join(" || ").slice(0, 600)}`);
	}
}
if (!reqs.length) console.log("(none)");
process.exit(0);
