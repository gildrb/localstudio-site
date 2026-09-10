#!/usr/bin/env node
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import { relative, join } from "node:path";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/u, "");
const forbidden = [
	["src/styles", ["global", "css"].join(".")].join("/"),
	["packages/demo-ui/src/styles", ["workbench", "demo.css"].join("-")].join("/"),
	"src/styles/ls-app.css",
	"packages/demo-ui/src/styles/ls-app.css",
	"src/styles/ls",
	"src/ls",
	"src/ls-shared",
	"src/ls-contracts",
	"src/sections/story",
	"src/sections/HeroDemo.tsx",
	"src/agent/catalog.ts",
	"src/machine.ts",
	"src/routes.ts",
	"src/images.ts",
	"src/routing.ts",
];
const generated = [
	{
		label: "design-manifest",
		args: ["scripts/design-manifest.ts", "write"],
		files: ["design-manifest.json"],
	},
	{
		label: "asset-manifest",
		args: ["scripts/assets.ts", "write"],
		files: ["asset-manifest.json"],
	},
	{
		label: "Vercel outputs",
		args: ["scripts/vercel.ts", "write"],
		files: ["vercel.json", "middleware.ts"],
	},
	{
		label: "index.html",
		args: ["scripts/index-html.ts", "write"],
		files: ["index.html"],
	},
];
const excludedCopyParts = new Set([
	".git",
	".context",
	"dist",
	".vite",
	".vite-plus",
	"node_modules",
	"playwright-report",
	"test-results",
]);

function assertNoForbiddenPaths() {
	const present = forbidden.filter((rel) => existsSync(join(root, rel)));
	if (present.length > 0) {
		throw new Error(`generated:check found leftover paths:\n${present.join("\n")}`);
	}
}

function copyFilter(source: string) {
	const rel = relative(root, source);
	return !rel.split(/[\\/]/u).some((part) => excludedCopyParts.has(part));
}

interface Generator {
	readonly label: string;
	readonly args: readonly string[];
}

function runGenerator(directory: string, { label, args }: Generator) {
	const result = spawnSync(process.execPath, args, {
		cwd: directory,
		encoding: "utf8",
		stdio: "inherit",
	});
	if (result.error) throw result.error;
	if (result.status !== 0) throw new Error(`${label} generation failed`);
}

function compareGenerated(directory: string, files: readonly string[]) {
	for (const rel of files) {
		const expected = readFileSync(join(directory, rel));
		const current = readFileSync(join(root, rel));
		if (!expected.equals(current)) throw new Error(`generated output is stale: ${rel}`);
	}
}

assertNoForbiddenPaths();
const temporaryRoot = mkdtempSync(join(tmpdir(), "ls-web-generated-"));
try {
	cpSync(root, temporaryRoot, { recursive: true, filter: copyFilter });
	// Temporary generators share installed root dependencies without copying them.
	const modules = join(root, "node_modules");
	if (existsSync(modules)) {
		symlinkSync(modules, join(temporaryRoot, "node_modules"), "junction");
	}
	// The mesh generators are checked in place because they use package-owned dependencies.
	runGenerator(root, {
		label: "logo mesh",
		args: ["packages/logo-renderer/scripts/generate-logo-mesh.ts", "--check"],
	});
	runGenerator(root, {
		label: "CTA mesh",
		args: ["packages/logo-renderer/scripts/generate-cta-mesh.ts", "--check"],
	});
	for (const output of generated) {
		runGenerator(temporaryRoot, output);
		compareGenerated(temporaryRoot, output.files);
	}
} finally {
	rmSync(temporaryRoot, { recursive: true, force: true });
}
console.log("generated outputs are deterministic and current");
