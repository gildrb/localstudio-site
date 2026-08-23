#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const command = process.argv[2] ?? "report";
const architecture = JSON.parse(readFileSync(join(root, "architecture.json"), "utf8"));

const SOURCE_EXT = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".txt"]);
const EXCLUDE_DIRS = new Set([
	"node_modules",
	"dist",
	".git",
	"test-results",
	"playwright-report",
	".context",
	"src/ls",
	"src/ls-shared",
	"src/ls-contracts",
	"src/sections/localai-logo-shader",
	"packages",
]);

function walk(directory) {
	const files = [];
	for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
		a.name.localeCompare(b.name),
	)) {
		const path = join(directory, entry.name);
		const rel = relative(root, path).split("\\").join("/");
		if (entry.isDirectory()) {
			if (!EXCLUDE_DIRS.has(entry.name) && !EXCLUDE_DIRS.has(rel)) {
				files.push(...walk(path));
			}
			continue;
		}
		const ext = entry.name.includes(".")
			? `.${entry.name.split(".").pop().toLowerCase()}`
			: "";
		if (SOURCE_EXT.has(ext)) files.push(rel);
	}
	return files;
}

function resolveImport(fromRel, spec) {
	if (!(spec.startsWith("./") || spec.startsWith("../"))) return null;
	const fromDir = dirname(join(root, fromRel));
	const raw = join(fromDir, spec.split("?")[0]);
	const candidates = [
		raw,
		`${raw}.ts`,
		`${raw}.tsx`,
		`${raw}.js`,
		`${raw}.mjs`,
		`${raw}.css`,
		join(raw, "index.ts"),
		join(raw, "index.tsx"),
	];
	for (const candidate of candidates) {
		try {
			if (statSync(candidate).isFile()) {
				return relative(root, candidate).split("\\").join("/");
			}
		} catch {
			// continue
		}
	}
	return null;
}

function importsOf(rel) {
	const text = readFileSync(join(root, rel), "utf8");
	const specs = [];
	const patterns = [
		/\b(?:import|export)\b[\s\S]*?\bfrom\s+["']([^"']+)["']/g,
		/^import\s+["']([^"']+)["']/gm,
		/import\(\s*["']([^"']+)["']\s*\)/g,
	];
	for (const pattern of patterns) {
		let match;
		while ((match = pattern.exec(text))) {
			specs.push(match[1]);
		}
	}
	return specs;
}

function componentName(rel) {
	if (!rel.endsWith(".tsx")) return null;
	if (
		!(
			rel.startsWith("src/components/") ||
			rel.startsWith("src/sections/") ||
			rel.startsWith("src/ui/") ||
			rel.startsWith("src/pages/")
		)
	) {
		return null;
	}
	if (rel.includes("/hero/") || rel.includes("/story/") || rel.includes("/localai-logo-shader/")) {
		return null;
	}
	return rel;
}

const files = walk(root).sort((a, b) => a.localeCompare(b));
const graph = new Map(files.map((file) => [file, new Set()]));
const unresolved = [];
for (const file of files) {
	for (const spec of importsOf(file)) {
		const resolved = resolveImport(file, spec);
		if (resolved && graph.has(resolved)) graph.get(file).add(resolved);
		else if (spec.startsWith("./") || spec.startsWith("../")) {
			unresolved.push(`${file} -> ${spec}`);
		}
	}
}

const roots = architecture.roots.filter((file) => files.includes(file));
const testFiles = files.filter((file) => file.startsWith("tests/"));
const reachable = new Set();
const queue = [...roots, ...testFiles];
while (queue.length > 0) {
	const current = queue.pop();
	if (reachable.has(current)) continue;
	reachable.add(current);
	for (const next of graph.get(current) ?? []) queue.push(next);
}

const generatedSources = new Set([
	"src/styles/ls/animations.css",
	"src/styles/ls/base.css",
	"src/styles/ls/chat.css",
	"src/styles/ls/tokens.css",
	"src/wgsl.d.ts",
]);
const unreachable = files.filter(
	(file) =>
		!reachable.has(file) &&
		!file.startsWith("tools/") &&
		!generatedSources.has(file),
);
const fanIn = new Map();
for (const [from, tos] of graph) {
	for (const to of tos) {
		if (!fanIn.has(to)) fanIn.set(to, new Set());
		fanIn.get(to).add(from);
	}
}

const singleConsumer = [];
for (const file of files) {
	const name = componentName(file);
	if (!name) continue;
	const consumers = [...(fanIn.get(file) ?? [])].filter((consumer) => consumer !== file);
	if (consumers.length === 1 && !architecture.singleConsumerComponents[file]) {
		singleConsumer.push({ file, consumer: consumers[0] });
	}
}

const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const declared = {
	...packageJson.dependencies,
	...packageJson.devDependencies,
};
const usedDeps = new Set();
const allText = files.map((file) => readFileSync(join(root, file), "utf8")).join("\n");
for (const name of Object.keys(declared)) {
	const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const pattern = new RegExp(`["']${escaped}(?:/[^"']*)?["']`);
	if (pattern.test(allText) || name.startsWith("@types/") || name === "typescript") {
		usedDeps.add(name);
	}
}
// special-case packages consumed by config/plugins rather than string imports
for (const name of [
	"@oxlint/plugins",
	"oxlint",
	"eslint",
	"@eslint/js",
	"globals",
	"typescript-eslint",
	"eslint-plugin-react-hooks",
	"eslint-plugin-react-refresh",
	"@playwright/test",
	"tailwindcss",
	"@tailwindcss/vite",
	"@vitejs/plugin-react",
	"vite",
	"@webgpu/types",
	"@vgpu/core",
	"@vgpu/render",
	"phase",
	"earcut",
]) {
	if (name in declared) usedDeps.add(name);
}
const unusedDeps = Object.keys(declared).filter((name) => !usedDeps.has(name));

function printReport() {
	console.log(`files ${files.length}`);
	console.log(`reachable ${reachable.size}`);
	console.log(`unreachable ${unreachable.length}`);
	for (const file of unreachable) console.log(`  unused-file ${file}`);
	console.log(`unresolved ${unresolved.length}`);
	for (const item of unresolved) console.log(`  unresolved ${item}`);
	console.log(`single-consumer-without-rationale ${singleConsumer.length}`);
	for (const item of singleConsumer) console.log(`  ${item.file} <- ${item.consumer}`);
	console.log(`unused-deps ${unusedDeps.length}`);
	for (const name of unusedDeps) console.log(`  unused-dep ${name}`);
	console.log("component fan-in");
	const components = files.filter((file) => componentName(file));
	for (const file of components.sort((a, b) => (fanIn.get(b)?.size ?? 0) - (fanIn.get(a)?.size ?? 0))) {
		const consumers = [...(fanIn.get(file) ?? [])];
		console.log(`  ${String(consumers.length).padStart(2)}  ${file}`);
	}
}

printReport();
if (command === "check" && process.env.GRAPH_ENFORCE === "1") {
	const failures = [];
	if (unreachable.length) failures.push(`unreachable files: ${unreachable.join(", ")}`);
	if (singleConsumer.length) {
		failures.push(
			`single-consumer components need architecture.json rationale: ${singleConsumer.map((item) => item.file).join(", ")}`,
		);
	}
	if (unusedDeps.length) failures.push(`unused dependencies: ${unusedDeps.join(", ")}`);
	if (failures.length) {
		console.error(failures.join("\n"));
		process.exitCode = 1;
	}
}
