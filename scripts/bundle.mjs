#!/usr/bin/env bun
import { gzipSync } from "node:zlib";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const command = process.argv[2] ?? "check";

const budgets = {
	sharedCssGzip: 20_480,
	criticalJsGzip: 122_880,
	lazyChunkGzip: 61_440,
};

function walk(directory) {
	const files = [];
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...walk(path));
			continue;
		}
		files.push(path);
	}
	return files;
}

function gzipBytes(path) {
	return gzipSync(readFileSync(path)).byteLength;
}

const dist = join(root, "dist");
try {
	statSync(join(dist, "index.html"));
} catch {
	console.error("bundle:check needs a production build in dist/");
	process.exit(1);
}

const assets = join(dist, "assets");
const files = walk(assets)
	.map((path) => {
		const name = path.slice(assets.length + 1).split("\\").join("/");
		return {
			name,
			bytes: statSync(path).size,
			gzip: gzipBytes(path),
		};
	})
	.toSorted((a, b) => a.name.localeCompare(b.name));

const css = files.filter((file) => file.name.endsWith(".css"));
const js = files.filter((file) => file.name.endsWith(".js"));
const sharedCss = css.length === 1 ? css[0] : undefined;

// The entry is the module script referenced by index.html; the eager set is
// its static-import closure (chunks without an import( boundary).
const entryName = readFileSync(join(dist, "index.html"), "utf8").match(
	/module" src="\/assets\/([^"]+\.js)"/,
)?.[1];
function staticImports(name) {
	const source = readFileSync(join(assets, name), "utf8");
	const found = new Set();
	for (const match of source.matchAll(/(?:^|;)(?:import|export)[^("';]*?from"\.\/([^"']+)"/g)) {
		found.add(match[1]);
	}
	for (const match of source.matchAll(/(?:^|;)import"\.\/([^"']+)"/g)) {
		found.add(match[1]);
	}
	return [...found].filter((imported) => js.some((file) => file.name === imported));
}
const eager = new Set();
const queue = entryName ? [entryName] : [];
while (queue.length > 0) {
	const current = queue.pop();
	if (eager.has(current)) continue;
	eager.add(current);
	queue.push(...staticImports(current));
}
const criticalJs = [...eager].map((name) => js.find((file) => file.name === name)).filter(Boolean);
const criticalGzip = criticalJs.reduce((sum, file) => sum + file.gzip, 0);
const lazyChunks = js.filter((file) => !eager.has(file.name));
const lazyHints = ["HeroDemo", "FeatureDemo", "shader"];

console.log(`entry ${entryName ?? "missing"}`);
console.log(`shared CSS ${sharedCss?.name ?? "missing"} ${sharedCss?.gzip ?? 0} gzip`);
console.log(`critical JS ${criticalJs.length} chunks ${criticalGzip} gzip`);
for (const file of criticalJs) {
	console.log(`  eager ${file.name} ${file.gzip} gzip`);
}
for (const file of lazyChunks) {
	console.log(`lazy ${file.name} ${file.gzip} gzip`);
}

if (command !== "check") process.exit(0);

const failures = [];
if (css.length !== 1) failures.push(`expected one collected StyleX CSS asset, found ${css.length}`);
if (!sharedCss) failures.push("missing shared StyleX CSS chunk");
else if (sharedCss.gzip > budgets.sharedCssGzip) {
	failures.push(`shared CSS ${sharedCss.gzip} exceeds ${budgets.sharedCssGzip}`);
}
if (!entryName) failures.push("missing entry script in index.html");
if (!criticalJs.length) failures.push("missing critical JS chunks");
else if (criticalGzip > budgets.criticalJsGzip) {
	failures.push(`critical JS ${criticalGzip} exceeds ${budgets.criticalJsGzip}`);
}
for (const file of lazyChunks) {
	if (file.gzip > budgets.lazyChunkGzip) {
		failures.push(`lazy chunk ${file.name} ${file.gzip} exceeds ${budgets.lazyChunkGzip}`);
	}
}
if (js.some((file) => file.name.startsWith("shader-") && eager.has(file.name))) {
	failures.push("WebGPU shader chunk is eager");
}
for (const hint of lazyHints) {
	if (!js.some((file) => file.name.startsWith(`${hint}-`))) {
		failures.push(`missing lazy ${hint} chunk`);
	}
}
if (failures.length) {
	console.error(failures.join("\n"));
	process.exit(1);
}
console.log("bundle:check passed");
