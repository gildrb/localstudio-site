import { createHash } from "node:crypto";
import { readFileSync, readdirSync, type Dirent } from "node:fs";
import { join, relative } from "node:path";

export const root = join(import.meta.dirname, "..");

const INCLUDE_EXT = new Set([
	".ts",
	".tsx",
	".js",
	".mjs",
	".css",
	".wgsl",
	".txt",
	".html",
	".json",
	".yml",
	".yaml",
]);
export const EXCLUDE_DIRS = new Set([
	"node_modules",
	"dist",
	".vite",
	".vite-plus",
	".git",
	"test-results",
	"playwright-report",
	".context",
]);
export const EXCLUDE_FILES = new Set(["pnpm-lock.yaml"]);
export const GENERATED_FILES = new Set([
	"asset-manifest.json",
	"design-manifest.json",
	"index.html",
	"middleware.ts",
	"vercel.json",
]);
export const EXCLUDED_CATEGORIES: ReadonlySet<ContextCategory> = new Set([
	"copied-product",
	"logo-renderer",
	"generated",
	"vendored-tooling",
]);
export const CATEGORY_BUDGETS = {
	"domain/content/agent": { target: 16_000, hard: 19_000 },
	"react pages/components/app": { target: 26_000, hard: 34_000 },
	"demos + scenario": { target: 15_000, hard: 18_000 },
	"StyleX/motion": { target: 11_000, hard: 14_000 },
	tests: { target: 18_000, hard: 20_000 },
	"build/config/tooling": { target: 30_000, hard: 35_000 },
	"package/html/misc": { target: 3_000, hard: 4_000 },
	"copied-product": { target: 0, hard: Number.POSITIVE_INFINITY },
	"logo-renderer": { target: 0, hard: Number.POSITIVE_INFINITY },
	generated: { target: 0, hard: Number.POSITIVE_INFINITY },
	"vendored-tooling": { target: 0, hard: Number.POSITIVE_INFINITY },
	other: { target: 0, hard: Number.POSITIVE_INFINITY },
};

// Refreshed after renderer and agent-ready coverage grew; ignored build output is excluded above.
export const TOTAL_OPERATING = 103_000;
export const TOTAL_HARD = 105_000;
export const TOTAL_WARN = 98_000;

export type ContextCategory = keyof typeof CATEGORY_BUDGETS;

export interface ContextFile {
	readonly path: string;
	readonly bytes: number;
	readonly chars: number;
	readonly tokens: number;
	readonly category: ContextCategory;
	readonly sha256: string;
	readonly text: string;
}

function walk(directory: string): string[] {
	const entries = readdirSync(directory, { withFileTypes: true }).toSorted(
		(a: Readonly<Dirent>, b: Readonly<Dirent>) => a.name.localeCompare(b.name),
	);
	const files: string[] = [];
	for (const entry of entries) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			if (!EXCLUDE_DIRS.has(entry.name)) files.push(...walk(path));
			continue;
		}
		const rel = relative(root, path).split("\\").join("/");
		if (EXCLUDE_FILES.has(entry.name)) continue;
		const ext = entry.name.includes(".")
			? `.${entry.name.slice(entry.name.lastIndexOf(".") + 1).toLowerCase()}`
			: "";
		if (!INCLUDE_EXT.has(ext)) continue;
		files.push(rel);
	}
	return files;
}

function classifySource(rel: string): ContextCategory | null {
	if (
		rel.startsWith("src/ls/") ||
		rel.startsWith("src/ls-shared/") ||
		rel.startsWith("src/ls-contracts/")
	) {
		return "copied-product";
	}
	if (rel.startsWith("packages/demo-ui/")) return "copied-product";
	if (
		rel.startsWith("src/sections/localai-logo-shader/") ||
		rel.startsWith("packages/logo-renderer/")
	) {
		return "logo-renderer";
	}
	if (
		rel.startsWith("src/agent/") ||
		rel.startsWith("src/content/") ||
		rel.startsWith("src/domain/") ||
		rel === "src/images.ts"
	) {
		return "domain/content/agent";
	}
	if (
		rel.startsWith("src/demo/") ||
		rel.startsWith("src/sections/hero/") ||
		rel.startsWith("src/sections/story/")
	) {
		return "demos + scenario";
	}
	return null;
}

function classify(rel: string): ContextCategory {
	if (GENERATED_FILES.has(rel)) return "generated";
	const sourceCategory = classifySource(rel);
	if (sourceCategory !== null) return sourceCategory;
	if (rel.startsWith("tools/oxlint/anti-slop/")) return "vendored-tooling";
	if (rel.startsWith("src/styles/") || rel.endsWith(".css")) {
		return "StyleX/motion";
	}
	if (rel.startsWith("tests/")) return "tests";
	if (
		rel.startsWith("scripts/") ||
		rel.startsWith("tools/") ||
		rel.startsWith(".github/") ||
		[
			"vite.config.ts",
			"pnpm-workspace.yaml",
			"playwright.config.ts",
			"middleware.ts",
			"tsconfig.json",
			"tsconfig.app.json",
			"tsconfig.node.json",
			"vercel.json",
			"src/wgsl.d.ts",
		].includes(rel)
	) {
		return "build/config/tooling";
	}
	if (
		rel.startsWith("src/pages/") ||
		rel.startsWith("src/components/") ||
		rel.startsWith("src/hooks/") ||
		rel.startsWith("src/sections/") ||
		rel === "src/app/App.tsx" ||
		rel === "src/main.tsx" ||
		rel.startsWith("src/app/")
	) {
		return "react pages/components/app";
	}
	if (["package.json", "index.html", "README.md", ".mcp.json", "architecture.json"].includes(rel)) {
		return "package/html/misc";
	}
	return "other";
}

function tokenize(text: string): number {
	return Math.ceil(text.length / 4);
}

export function collect(): readonly ContextFile[] {
	const files = walk(root).toSorted((a, b) => a.localeCompare(b));
	const rows: ContextFile[] = [];
	for (const rel of files) {
		const raw = readFileSync(join(root, rel));
		if (raw.includes(0)) {
			throw new Error(`unexpected null byte: ${rel}`);
		}
		const text = raw.toString("utf8").replaceAll("\r\n", "\n").replaceAll("\r", "\n");
		rows.push({
			path: rel,
			bytes: raw.byteLength,
			chars: text.length,
			tokens: tokenize(text),
			category: classify(rel),
			sha256: createHash("sha256").update(raw).digest("hex"),
			text,
		});
	}
	return rows;
}
