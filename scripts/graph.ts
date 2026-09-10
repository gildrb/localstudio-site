#!/usr/bin/env node
import { type Dirent, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import architecture from "../architecture.json" with { type: "json" };
import packageJson from "../package.json" with { type: "json" };
import demoUiManifest from "../packages/demo-ui/package.json" with { type: "json" };
import rendererManifest from "../packages/logo-renderer/package.json" with { type: "json" };

const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/u, "");
const command = process.argv[2] ?? "report";

const SOURCE_EXT = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".wgsl", ".txt"]);
const EXCLUDE_DIRS = new Set([
	"node_modules",
	"dist",
	".vite",
	".vite-plus",
	".git",
	"test-results",
	"playwright-report",
	".context",
	"src/ls",
	"src/ls-shared",
	"src/ls-contracts",
	"src/sections/localai-logo-shader",
]);

function walk(directory: string): string[] {
	const files: string[] = [];
	for (const entry of readdirSync(directory, { withFileTypes: true }).toSorted(
		(a: Readonly<Dirent>, b: Readonly<Dirent>) => a.name.localeCompare(b.name),
	)) {
		const path = join(directory, entry.name);
		const rel = relative(root, path).replaceAll("\\", "/");
		if (entry.isDirectory()) {
			if (!EXCLUDE_DIRS.has(entry.name) && !EXCLUDE_DIRS.has(rel)) {
				files.push(...walk(path));
			}
			continue;
		}
		const ext = entry.name.includes(".")
			? entry.name.slice(entry.name.lastIndexOf(".")).toLowerCase()
			: "";
		if (SOURCE_EXT.has(ext)) files.push(rel);
	}
	return files;
}

function resolveImport(fromRel: string, spec: string): string | null {
	if (!(spec.startsWith("./") || spec.startsWith("../"))) return null;
	const fromDir = dirname(join(root, fromRel));
	const raw = join(fromDir, spec.split("?", 1).join(""));
	const candidates = [
		raw,
		`${raw}.ts`,
		`${raw}.tsx`,
		`${raw}.js`,
		`${raw}.mjs`,
		`${raw}.css`,
		`${raw}.wgsl`,
		join(raw, "index.ts"),
		join(raw, "index.tsx"),
	];
	for (const candidate of candidates) {
		try {
			if (statSync(candidate).isFile()) {
				return relative(root, candidate).replaceAll("\\", "/");
			}
		} catch {
			// continue
		}
	}
	return null;
}

function importsOf(rel: string): string[] {
	const text = readFileSync(join(root, rel), "utf8");
	const specs: string[] = [];
	const patterns = [
		/\b(?:import|export)\b[\s\S]*?\bfrom\s+["']([^"']+)["']/gu,
		/^import\s+["']([^"']+)["']/gmu,
		/import\(\s*["']([^"']+)["']\s*\)/gu,
		/@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?/gu,
	];
	for (const pattern of patterns) {
		for (const match of text.matchAll(pattern)) {
			const spec = match[1];
			if (spec !== undefined) specs.push(spec);
		}
	}
	return specs;
}

function componentName(rel: string): string | null {
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

const files = walk(root).toSorted((a, b) => a.localeCompare(b));
const graph = new Map<string, Set<string>>(files.map((file) => [file, new Set<string>()]));
const unresolved: string[] = [];
for (const [file, imports] of graph) {
	for (const spec of importsOf(file)) {
		const resolved = resolveImport(file, spec);
		if (resolved !== null) {
			if (graph.has(resolved)) imports.add(resolved);
		} else if ((spec.startsWith("./") || spec.startsWith("../")) && !spec.includes("/packages/")) {
			unresolved.push(`${file} -> ${spec}`);
		}
	}
}

const roots = architecture.roots.filter((file) => files.includes(file));
const testFiles = files.filter((file) => file.startsWith("tests/"));
const reachable = new Set<string>();
const queue = [...roots, ...testFiles];
while (queue.length > 0) {
	const current = queue.pop();
	if (current === undefined || reachable.has(current)) continue;
	reachable.add(current);
	for (const next of graph.get(current) ?? []) queue.push(next);
}

const unreachable = files.filter((file) => !reachable.has(file) && !file.startsWith("tools/"));
const fanIn = new Map<string, Set<string>>();
for (const [from, tos] of graph) {
	for (const to of tos) {
		const consumers = fanIn.get(to) ?? new Set<string>();
		consumers.add(from);
		fanIn.set(to, consumers);
	}
}

interface SingleConsumer {
	readonly file: string;
	readonly consumer: string;
}

const singleConsumer: SingleConsumer[] = [];
const rationales = new Map(Object.entries(architecture.singleConsumerComponents));
for (const file of files) {
	const name = componentName(file);
	if (name === null) continue;
	const consumers = [...(fanIn.get(file) ?? [])].filter((consumer) => consumer !== file);
	const [consumer] = consumers;
	if (
		consumers.length === 1 &&
		consumer !== undefined &&
		(rationales.get(file)?.length ?? 0) === 0
	) {
		singleConsumer.push({ file, consumer });
	}
}

const declared = {
	...packageJson.dependencies,
	...packageJson.devDependencies,
};
const usedDeps = new Set<string>();
const allText = files.map((file) => readFileSync(join(root, file), "utf8")).join("\n");
for (const name of Object.keys(declared)) {
	const escaped = name.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&");
	const pattern = new RegExp(`["']${escaped}(?:/[^"']*)?["']`, "u");
	if (pattern.test(allText) || name.startsWith("@types/") || name === "typescript") {
		usedDeps.add(name);
	}
}
// special-case packages consumed by config/plugins rather than string imports
for (const name of ["@oxlint/plugins", "@playwright/test"]) {
	if (name in declared) usedDeps.add(name);
}
const unusedDeps = Object.keys(declared).filter((name) => !usedDeps.has(name));
const workspaceManifests = [
	{ root: "packages/demo-ui", manifest: demoUiManifest },
	{ root: "packages/logo-renderer", manifest: rendererManifest },
];

function packageName(spec: string): string | null {
	if (spec.startsWith("node:") || spec.startsWith(".") || spec.startsWith("/")) return null;
	return spec
		.split("/")
		.slice(0, spec.startsWith("@") ? 2 : 1)
		.join("/");
}

const packageDependencyGaps: string[] = [];
for (const workspacePackage of workspaceManifests) {
	const { manifest } = workspacePackage;
	const declaredPackageDeps = new Set([
		...Object.keys(manifest.dependencies),
		...Object.keys(manifest.devDependencies),
		...Object.keys(manifest.peerDependencies),
	]);
	for (const file of files.filter((item) => item.startsWith(`${workspacePackage.root}/`))) {
		for (const spec of importsOf(file)) {
			const name = packageName(spec);
			if (name !== null && name !== "" && !declaredPackageDeps.has(name)) {
				packageDependencyGaps.push(`${file} imports ${name} without a package declaration`);
			}
		}
	}
}

function printReport(): void {
	console.log(`files ${String(files.length)}`);
	console.log(`reachable ${String(reachable.size)}`);
	console.log(`unreachable ${String(unreachable.length)}`);
	for (const file of unreachable) console.log(`  unused-file ${file}`);
	console.log(`unresolved ${String(unresolved.length)}`);
	for (const item of unresolved) console.log(`  unresolved ${item}`);
	console.log(`single-consumer-without-rationale ${String(singleConsumer.length)}`);
	for (const item of singleConsumer) console.log(`  ${item.file} <- ${item.consumer}`);
	console.log(`unused-deps ${String(unusedDeps.length)}`);
	for (const name of unusedDeps) console.log(`  unused-dep ${name}`);
	console.log(`package-dependency-gaps ${String(packageDependencyGaps.length)}`);
	for (const gap of packageDependencyGaps) console.log(`  ${gap}`);
	console.log("component fan-in");
	const components = files.filter((file) => componentName(file) !== null);
	for (const file of components.toSorted(
		(a, b) => (fanIn.get(b)?.size ?? 0) - (fanIn.get(a)?.size ?? 0),
	)) {
		const consumers = [...(fanIn.get(file) ?? [])];
		console.log(`  ${String(consumers.length).padStart(2)}  ${file}`);
	}
}

printReport();
if (command === "check") {
	const failures: string[] = [];
	if (unreachable.length > 0) failures.push(`unreachable files: ${unreachable.join(", ")}`);
	if (singleConsumer.length > 0) {
		failures.push(
			`single-consumer components need architecture.json rationale: ${singleConsumer.map((item) => item.file).join(", ")}`,
		);
	}
	if (unusedDeps.length > 0) failures.push(`unused dependencies: ${unusedDeps.join(", ")}`);
	if (packageDependencyGaps.length > 0)
		failures.push(`workspace package dependency gaps: ${packageDependencyGaps.join(", ")}`);
	if (failures.length > 0) {
		console.error(failures.join("\n"));
		process.exitCode = 1;
	}
}
