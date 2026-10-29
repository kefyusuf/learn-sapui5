#!/usr/bin/env node
/**
 * Headless QUnit runner for the examples in this repo.
 *
 * Starts `ui5 serve` for each example that has a unit test page, runs the
 * page in headless Chrome (same technique as the manual verification
 * flows), parses the rendered QUnit results and exits non-zero on any
 * failure. No extra test dependencies - Chrome + this script are enough.
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
const CHROME = process.env.CHROME_BIN
	|| "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const TESTPAGE = "test/unit/unitTests.qunit.html";

const TARGETS = [
	{ prefix: "03", dir: "03-data-binding-forms", port: 8083 },
	{ prefix: "04", dir: "04-controls-lists-dialogs", port: 8084 },
	{ prefix: "05", dir: "05-routing-master-detail", port: 8085 },
	{ prefix: "06", dir: "06-odata-mockserver", port: 8086 },
	{ prefix: "07", dir: "07-crud-leave-request", port: 8087 },
	{ prefix: "08", dir: "08-real-odata-northwind", port: 8088 }
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

function dumpDom(url) {
	const profile = mkdtempSync(join(tmpdir(), "ui5-test-"));
	try {
		return execSync(
			`"${CHROME}" --headless=new --disable-gpu --no-sandbox --no-first-run` +
			` --user-data-dir="${profile}" --virtual-time-budget=30000 --dump-dom "${url}"`,
			{ encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 120000 }
		);
	} finally {
		rmSync(profile, { recursive: true, force: true });
	}
}

function parseResults(dom) {
	// QUnit 2.3's result element has two phrasings:
	// all pass:  "N assertions of N passed, 0 failed."
	// failures:  "N tests completed in X ms, with F failed, ..."
	const passedMatch = /(\d+)\s+assertions?\s+of\s+(\d+)\s+passed/.exec(dom);
	const failedMatch = /(\d+)\s+tests?\s+completed[^,]*,?\s*with\s+(\d+)\s+failed/.exec(dom);
	const totalFailures = failedMatch
		? Number(failedMatch[2])
		: (dom.match(/<li[^>]*class="fail"/g) ?? []).length;
	// Pair each test <li> with the test-name INSIDE the same block only
	// (bounded lookahead), so pass blocks never leak into the failure list.
	const failures = [...dom.matchAll(
		/<li[^>]*class="fail"[^>]*>(?:(?!<\/li>|<li)[\s\S])*?class="test-name"[^>]*>([^<]*)/g
	)].map((m) => m[1].trim());
	const ran = Boolean(passedMatch || failedMatch);
	return {
		run: ran,
		passed: ran && totalFailures === 0,
		summary: ran
			? (passedMatch
				? `all green: ${passedMatch[1]}/${passedMatch[2]} assertions passed`
				: `tests: ${failedMatch[1]}, failing: ${totalFailures}`)
			: "QUnit did not report a result",
		failures: [...new Set(failures)]
	};
}

function stopServer(child) {
	if (process.platform === "win32") {
		try { execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: "ignore" }); } catch { /* already gone */ }
	} else {
		child.kill("SIGTERM");
	}
}

let anyFailed = false;

for (const t of targets) {
	const cwd = join(ROOT, "examples", t.dir);
	const page = join(cwd, "webapp", TESTPAGE);
	if (!existsSync(page)) {
		console.log(`- ${t.prefix} ${t.dir}: no test page, skipped`);
		continue;
	}

	console.log(`- ${t.prefix} ${t.dir}: starting ui5 serve on port ${t.port}...`);
	const npx = process.platform === "win32" ? "npx.cmd" : "npx";
	const server = spawn(npx, ["ui5", "serve", "--port", String(t.port)], {
		cwd, stdio: "ignore", shell: process.platform === "win32"
	});

	try {
		const url = `http://localhost:${t.port}/${TESTPAGE}`;
		const up = await waitForServer(url);
		if (!up) {
			console.log(`  FAILED: server did not come up`);
			anyFailed = true;
			continue;
		}

		const dom = dumpDom(url);
		const r = parseResults(dom);
		if (!r.run || !r.passed) anyFailed = true;
		console.log(`  ${r.run && r.passed ? "PASS" : "FAIL"}: ${r.summary}`);
		for (const f of r.failures) console.log(`    failing: ${f}`);
	} finally {
		stopServer(server);
	}
}

process.exit(anyFailed ? 1 : 0);
