#!/usr/bin/env node
import { gzipSync } from "node:zlib";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
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

const dist = join(root, "dist");
let manifest;
try {
	statSync(join(dist, "index.html"));
	manifest = JSON.parse(readFileSync(join(dist, ".vite/manifest.json"), "utf8"));
} catch (error) {
	console.error(
		"bundle:check needs a production build with build.manifest enabled in dist/",
		error.message,
	);
	process.exit(1);
}

const files = walk(join(dist, "assets"))
	.map((path) => ({
		name: relative(dist, path).split("\\").join("/"),
		bytes: statSync(path).size,
		gzip: gzipSync(readFileSync(path)).byteLength,
	}))
	.toSorted((a, b) => a.name.localeCompare(b.name));
const css = files.filter((file) => file.name.endsWith(".css"));
const js = files.filter((file) => file.name.endsWith(".js") || file.name.endsWith(".mjs"));
const sharedCss = css.length === 1 ? css[0] : undefined;

// Vite records static and dynamic edges separately. Only the static-import
// closure belongs to the critical path, regardless of chunk names or JS syntax.
const entry = manifest["index.html"];
const eager = new Set();
const visited = new Set();
const queue = entry?.isEntry ? ["index.html"] : [];
while (queue.length > 0) {
	const key = queue.pop();
	if (visited.has(key)) continue;
	visited.add(key);
	const chunk = manifest[key];
	if (!chunk) throw new Error(`missing imported chunk in Vite manifest: ${key}`);
	eager.add(chunk.file);
	queue.push(...(chunk.imports ?? []));
}
const criticalJs = js.filter((file) => eager.has(file.name));
const criticalGzip = criticalJs.reduce((sum, file) => sum + file.gzip, 0);
const lazyChunks = js.filter((file) => !eager.has(file.name));
const lazySources = ["src/pages/DownloadPage.tsx", "src/pages/MachinePage.tsx"];

console.log(`entry ${entry?.file ?? "missing"}`);
console.log(`shared CSS ${sharedCss?.name ?? "missing"} ${sharedCss?.gzip ?? 0} gzip`);
console.log(`critical JS ${criticalJs.length} chunks ${criticalGzip} gzip`);
for (const file of criticalJs) console.log(`  eager ${file.name} ${file.gzip} gzip`);
for (const file of lazyChunks) console.log(`lazy ${file.name} ${file.gzip} gzip`);

if (command !== "check") process.exit(0);

const failures = [];
if (css.length !== 1) failures.push(`expected one collected StyleX CSS asset, found ${css.length}`);
if (!sharedCss) failures.push("missing shared StyleX CSS chunk");
else if (sharedCss.gzip > budgets.sharedCssGzip) {
	failures.push(`shared CSS ${sharedCss.gzip} exceeds ${budgets.sharedCssGzip}`);
}
if (!entry?.isEntry) failures.push("missing index.html entry in Vite manifest");
for (const name of eager) {
	if (!js.some((file) => file.name === name)) failures.push(`missing critical JS asset: ${name}`);
}
if (!criticalJs.length) failures.push("missing critical JS chunks");
else if (criticalGzip > budgets.criticalJsGzip) {
	failures.push(`critical JS ${criticalGzip} exceeds ${budgets.criticalJsGzip}`);
}
for (const file of lazyChunks) {
	if (file.gzip > budgets.lazyChunkGzip) {
		failures.push(`lazy chunk ${file.name} ${file.gzip} exceeds ${budgets.lazyChunkGzip}`);
	}
}
for (const source of lazySources) {
	const chunk = manifest[source];
	if (!chunk?.isDynamicEntry || !js.some((file) => file.name === chunk.file)) {
		failures.push(`missing lazy entry: ${source}`);
	} else if (eager.has(chunk.file)) {
		failures.push(`lazy entry is eager: ${source}`);
	}
}
if (failures.length) {
	console.error(failures.join("\n"));
	process.exit(1);
}
console.log("bundle:check passed");
