#!/usr/bin/env node
/**
 * Headless QUnit/OPA5/smoke runner for the examples in this repo.
 *
 * For each example it starts `ui5 serve`, opens the test pages in
 * headless Chrome via the DevTools protocol and POLLS in real time:
 *   - QUnit pages: until the result element reports the finished run
 *   - smoke pages: until the body text contains the expected marker
 * Exits non-zero on any failure. No extra test dependencies.
 *
 * Usage:
 *   node scripts/test-headless.mjs           # all examples with tests
 *   node scripts/test-headless.mjs 03        # single example by prefix
 */
import { spawn, execSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import http from "node:http";

const ROOT = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const CHROME_CANDIDATES = [
	process.env.CHROME_BIN,
	"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
	"/usr/bin/google-chrome",
	"/usr/bin/google-chrome-stable",
	"/usr/bin/chromium-browser",
	"/usr/bin/chromium"
].filter(Boolean);
const CHROME = CHROME_CANDIDATES.find((p) => existsSync(p)) || CHROME_CANDIDATES[0];
const TESTPAGES = [
	"test/unit/unitTests.qunit.html",
	"test/integration/opaTests.qunit.html"
];
const PAGE_TIMEOUT_MS = 300000;
const POLL_INTERVAL_MS = 1500;

const TARGETS = [
	{ prefix: "01", dir: "01-hello-world", port: 8081 },
	{ prefix: "02", dir: "02-mvc-i18n", port: 8082 },
	{ prefix: "03", dir: "03-data-binding-forms", port: 8083 },
	{ prefix: "04", dir: "04-controls-lists-dialogs", port: 8084 },
	{ prefix: "05", dir: "05-routing-master-detail", port: 8085 },
	{ prefix: "06", dir: "06-odata-mockserver", port: 8086 },
	{ prefix: "07", dir: "07-crud-leave-request", port: 8087,
		smoke: { page: "test/flpSandbox.html", marker: "Leave Requests" } },
	{ prefix: "08", dir: "08-real-odata-northwind", port: 8088 },
	{ prefix: "09", dir: "09-fiori-elements-products", port: 8089 },
	{ prefix: "10", dir: "10-odata-v4", port: 8091 }
];

const filter = process.argv[2];
const targets = filter ? TARGETS.filter((t) => t.prefix === filter) : TARGETS;
if (targets.length === 0) {
	console.error(`No test target matches "${filter}".`);
	process.exit(2);
}

function get(url) {
	return new Promise((res) => {
		const req = http.get(url, (r) => { void r.resume(); res(r.statusCode ?? 0); });
		req.on("error", () => res(0));
		req.setTimeout(1000, () => { req.destroy(); res(0); });
	});
}

async function waitForServer(url, tries = 60) {
	for (let i = 0; i < tries; i++) {
		if ((await get(url)) !== 0) return true;
		await new Promise((r) => setTimeout(r, 500));
	}
	return false;
}

/**
 * Opens the page via the DevTools protocol and polls until done:
 *  - mode "qunit": the result element reports the finished run
 *  - mode "smoke": the body text contains the expected marker
 */
async function runPage(url, sMode, sMarker) {
	const profile = mkdtempSync(join(tmpdir(), "ui5-test-"));
	const isWin = process.platform === "win32";
	const chrome = spawn(
		isWin ? `"${CHROME}"` : CHROME,
		[
			"--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run",
			"--window-size=1600,1200", `--user-data-dir="${profile}"`,
			"--remote-debugging-port=0", "about:blank"
		],
		{ shell: isWin, stdio: ["ignore", "ignore", "pipe"] }
	);

	let wsUrl = "";
	chrome.stderr.on("data", (chunk) => {
		const m = /DevTools listening on (ws:\/\/\S+)/.exec(chunk.toString());
		if (m && !wsUrl) wsUrl = m[1];
	});

	try {
		for (let i = 0; i < 100 && !wsUrl; i++) {
			await new Promise((r) => setTimeout(r, 100));
		}
		if (!wsUrl) throw new Error("Chrome did not expose the DevTools websocket");

		const httpPort = /ws:\/\/127\.0\.0\.1:(\d+)\//.exec(wsUrl)?.[1];
		if (!httpPort) throw new Error("Cannot parse the DevTools port");

		const listRaw = await new Promise((res, rej) => {
			http.get({ host: "127.0.0.1", port: Number(httpPort), path: "/json/list" }, (r) => {
				let d = "";
				r.on("data", (c) => (d += c));
				r.on("end", () => res(d));
			}).on("error", rej);
		});
		const page = JSON.parse(listRaw).find((t) => t.type === "page");
		if (!page) throw new Error("No page target in Chrome");

		const ws = new WebSocket(page.webSocketDebuggerUrl);
		await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

		let msgId = 0;
		const pending = new Map();
		ws.onmessage = (ev) => {
			const m = JSON.parse(ev.data);
			if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
		};
		const send = (method, params = {}) => new Promise((res) => {
			const id = ++msgId;
			pending.set(id, res);
			ws.send(JSON.stringify({ id, method, params }));
		});
		const evalJs = async (expression) => {
			const r = await send("Runtime.evaluate", { expression, returnByValue: true });
			return r.result?.result?.value;
		};

		await send("Runtime.enable");
		await send("Page.enable");
		await send("Page.navigate", { url });

		const started = Date.now();
		let resultText = "";
		let smokeHit = false;
		while (Date.now() - started < PAGE_TIMEOUT_MS) {
			await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
			if (sMode === "smoke") {
				smokeHit = (await evalJs(
					`document.body.innerText.includes(${JSON.stringify(sMarker)})`
				)) === true;
				if (smokeHit) break;
			} else {
				resultText = (await evalJs(
					"(document.getElementById('qunit-testresult') || {}).textContent || ''"
				)) || "";
				// QUnit briefly reports "0 tests completed" while journeys
				// register late (autostart: false) - only a NON-zero count or
				// the passing summary means the run is finished.
				if (/([1-9]\d*)\s+tests?\s+completed/.test(resultText) || /([1-9]\d*)\s+assertions?\s+of/.test(resultText)) break;
			}
		}

		let failures = [];
		if (sMode === "qunit") {
			failures = JSON.parse((await evalJs(
				"JSON.stringify([...document.querySelectorAll('li.fail .test-name')].map(e => e.textContent.trim()))"
			)) || "[]");
		}

		ws.close();
		return { mode: sMode, resultText: resultText.trim(), smokeHit, failures };
	} finally {
		if (isWin) {
			try { execSync(`taskkill /pid ${chrome.pid} /T /F`, { stdio: "ignore" }); } catch { /* gone */ }
		} else {
			try { process.kill(-chrome.pid, "SIGTERM"); } catch { chrome.kill("SIGTERM"); }
		}
		// Best effort: Chrome may hold file locks briefly after being killed.
		try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); } catch { /* leave temp dir */ }
	}
}

function parseResults(oPage) {
	const ran = oPage.mode === "qunit" && Boolean(oPage.resultText);
	const failedMatch = /with\s+(\d+)\s+failed/.exec(oPage.resultText);
	return {
		run: ran,
		passed: ran && (!failedMatch || Number(failedMatch[1]) === 0),
		summary: ran ? oPage.resultText.replace(/\s+/g, " ").trim() : "QUnit did not report a result",
		failures: oPage.failures
	};
}

function stopServer(child) {
	if (process.platform === "win32") {
		try { execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: "ignore" }); } catch { /* already gone */ }
	} else {
		try { process.kill(-child.pid, "SIGTERM"); } catch { child.kill("SIGTERM"); }
	}
}

let anyFailed = false;

for (const t of targets) {
	const cwd = join(ROOT, "examples", t.dir);

	// Collect the pages to exercise for this target.
	const entries = TESTPAGES.filter((p) => existsSync(join(cwd, "webapp", p)))
		.map((p) => ({ page: p, mode: "qunit" }));
	if (t.smoke && existsSync(join(cwd, "webapp", t.smoke.page))) {
		entries.push({ page: t.smoke.page, mode: "smoke", marker: t.smoke.marker });
	}
	if (entries.length === 0) {
		continue;
	}

	const npx = process.platform === "win32" ? "npx.cmd" : "npx";
	const server = spawn(npx, ["ui5", "serve", "--port", String(t.port)], {
		cwd, stdio: "ignore", shell: process.platform === "win32",
		// On Linux the child becomes a group leader so stopServer can kill
		// the whole tree (npx -> ui5 -> ...) with one signal.
		detached: process.platform !== "win32"
	});

	try {
		if (!(await waitForServer(`http://localhost:${t.port}/`))) {
			console.log(`- ${t.prefix} ${t.dir}: FAILED, server did not come up`);
			anyFailed = true;
			continue;
		}

		for (const e of entries) {
			const url = `http://localhost:${t.port}/${e.page}`;
			console.log(`- ${t.prefix} ${t.dir}: ${e.page}...`);
			const oPage = await runPage(url, e.mode, e.marker);
			if (e.mode === "smoke") {
				if (!oPage.smokeHit) anyFailed = true;
				console.log(`  ${oPage.smokeHit ? "PASS" : "FAIL"}: marker "${e.marker}" ${oPage.smokeHit ? "found" : "never appeared"}`);
			} else {
				const r = parseResults(oPage);
				if (!r.run || !r.passed) anyFailed = true;
				console.log(`  ${r.run && r.passed ? "PASS" : "FAIL"}: ${r.summary}`);
				for (const f of r.failures) console.log(`    failing: ${f}`);
			}
		}
	} finally {
		stopServer(server);
	}
}

process.exit(anyFailed ? 1 : 0);
