#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import * as v from "valibot";
import demoPackage from "../packages/demo-ui/package.json" with { type: "json" };
import rendererPackage from "../packages/logo-renderer/package.json" with { type: "json" };
import tsconfig from "../tsconfig.json" with { type: "json" };
import {
	CATEGORY_BUDGETS,
	EXCLUDE_DIRS,
	EXCLUDE_FILES,
	EXCLUDED_CATEGORIES,
	GENERATED_FILES,
	TOTAL_HARD,
	TOTAL_OPERATING,
	TOTAL_WARN,
	collect,
	root,
	type ContextCategory,
	type ContextFile,
} from "./context-catalog.ts";

const command = process.argv[2] ?? "report";
const workspaceSchema = v.object({ packages: v.optional(v.array(v.string())) });
const WORKSPACE_PACKAGES = [
	{
		root: "packages/demo-ui",
		category: "copied-product",
		manifest: "packages/demo-ui/package.json",
		...demoPackage,
	},
	{
		root: "packages/logo-renderer",
		category: "logo-renderer",
		manifest: "packages/logo-renderer/package.json",
		...rendererPackage,
	},
] satisfies readonly WorkspacePackage[];

interface WorkspacePackage {
	readonly root: string;
	readonly manifest: string;
	readonly category: ContextCategory;
	readonly name: string;
	readonly version: string;
}

interface CategoryStats {
	readonly files: number;
	readonly bytes: number;
	readonly tokens: number;
}

function validateWorkspacePackages(): void {
	const input: unknown = parse(readFileSync(join(root, "pnpm-workspace.yaml"), "utf8"));
	const workspace = v.parse(workspaceSchema, input);
	const failures: string[] = [];
	if (workspace.packages?.includes("packages/*") !== true) {
		failures.push("pnpm-workspace.yaml packages must include packages/*");
	}
	for (const workspacePackage of WORKSPACE_PACKAGES) {
		if (workspacePackage.name.length === 0) {
			failures.push(`${workspacePackage.root} has no package name`);
		}
		if (workspacePackage.version.length === 0 || workspacePackage.version === "0.0.0") {
			failures.push(`${workspacePackage.root} must have an explicit package version`);
		}
		if (
			!tsconfig.references.some(
				({ path }: Readonly<(typeof tsconfig.references)[number]>) =>
					path.replace(/^\.\//u, "").replace(/\/tsconfig\.json$/u, "") === workspacePackage.root,
			)
		) {
			failures.push(`${workspacePackage.root} must be referenced by the root tsconfig.json`);
		}
	}
	if (failures.length > 0) throw new Error(failures.join("\n"));
}

function categoryTotals(rows: readonly ContextFile[]): Map<ContextCategory, CategoryStats> {
	const totals = new Map<ContextCategory, CategoryStats>();
	for (const row of rows) {
		const current = totals.get(row.category) ?? { files: 0, bytes: 0, tokens: 0 };
		totals.set(row.category, {
			files: current.files + 1,
			bytes: current.bytes + row.bytes,
			tokens: current.tokens + row.tokens,
		});
	}
	return totals;
}

function counted(rows: readonly ContextFile[]) {
	return rows.filter((row) => !EXCLUDED_CATEGORIES.has(row.category));
}

function printReport(rows: readonly ContextFile[]) {
	const all = categoryTotals(rows);
	const countedRows = counted(rows);
	const countedTotal = countedRows.reduce((sum, row) => sum + row.tokens, 0);
	const lines = [
		`files ${rows.length}`,
		`counted tokens ${countedTotal} (operating ${TOTAL_OPERATING}, hard ${TOTAL_HARD})`,
		"",
		"categories",
	];
	for (const [category, stats] of [...all].toSorted(
		(a: readonly [ContextCategory, CategoryStats], b: readonly [ContextCategory, CategoryStats]) =>
			b[1].tokens - a[1].tokens,
	)) {
		const budget = CATEGORY_BUDGETS[category];
		lines.push(
			`  ${category.padEnd(32)} ${String(stats.tokens).padStart(7)} tokens  ${stats.files} files  target ${budget.target} hard ${Number.isFinite(budget.hard) ? budget.hard : "inf"}`,
		);
	}
	const excludedRows = rows.filter((row) => EXCLUDED_CATEGORIES.has(row.category));
	const excludedTokens = excludedRows.reduce((sum, row) => sum + row.tokens, 0);
	lines.push(
		"",
		`excluded tokens ${excludedTokens} (workspace packages, generated outputs, and copied assets)`,
		"exclusion basis",
		...WORKSPACE_PACKAGES.map(
			({ root: packageRoot, name, version, category }: WorkspacePackage) =>
				`  ${name}@${version}  ${packageRoot}  (${category}; package typecheck runs in vp check)`,
		),
		`  generated files: ${[...GENERATED_FILES].join(", ")}`,
		`  excluded directories: ${[...EXCLUDE_DIRS].join(", ")}`,
		`  excluded files: ${[...EXCLUDE_FILES].join(", ")}`,
		"",
		"top 50",
	);
	for (const row of [...rows].toSorted((a, b) => b.tokens - a.tokens).slice(0, 50)) {
		lines.push(`  ${String(row.tokens).padStart(6)}  ${row.category.padEnd(28)}  ${row.path}`);
	}
	console.log(lines.join("\n"));
	return { countedTotal, all };
}

function writeBundle(rows: readonly ContextFile[]) {
	const countedRows = counted(rows);
	mkdirSync(join(root, ".context"), { recursive: true });
	const body = countedRows
		.map((row) => `<!-- file: ${row.path} sha256:${row.sha256} -->\n\`\`\`\n${row.text}\n\`\`\`\n`)
		.join("\n");
	writeFileSync(join(root, ".context/implementation.md"), body);
	writeFileSync(
		join(root, ".context/manifest.json"),
		`${JSON.stringify(
			{
				tokenizer: "approx ceil(utf8_chars/4) after newline normalize",
				exclusions: {
					workspacePackages: WORKSPACE_PACKAGES.map(
						({ root: packageRoot, name, version, category }: WorkspacePackage) => ({
							root: packageRoot,
							name,
							version,
							category,
						}),
					),
					categories: [...EXCLUDED_CATEGORIES],
					files: [...EXCLUDE_FILES],
					generatedFiles: [...GENERATED_FILES],
				},
				files: rows.map(({ path, bytes, tokens, category, sha256 }) => ({
					path,
					bytes,
					tokens,
					category,
					sha256,
				})),
			},
			null,
			"\t",
		)}\n`,
	);
}

function check(rows: readonly ContextFile[]) {
	const countedRows = counted(rows);
	const countedTotal = countedRows.reduce((sum, row) => sum + row.tokens, 0);
	const failures = [];
	if (countedTotal > TOTAL_HARD) {
		failures.push(`total ${countedTotal} exceeds hard ceiling ${TOTAL_HARD}`);
	}
	if (countedTotal > TOTAL_OPERATING) {
		failures.push(`total ${countedTotal} exceeds operating gate ${TOTAL_OPERATING}`);
	}
	const totals = categoryTotals(countedRows);
	for (const [category, stats] of totals) {
		const budget = CATEGORY_BUDGETS[category];
		if (Number.isFinite(budget.hard) && stats.tokens > budget.hard) {
			failures.push(`${category} ${stats.tokens} exceeds hard ${budget.hard}`);
		}
	}
	if (countedTotal >= TOTAL_WARN && countedTotal <= TOTAL_OPERATING) {
		console.warn(`warning: counted tokens ${countedTotal} >= ${TOTAL_WARN}`);
	}
	if (failures.length > 0) {
		console.error(failures.join("\n"));
		process.exitCode = 1;
	}
}

const rows = collect();
validateWorkspacePackages();
if (command === "report") {
	printReport(rows);
} else if (command === "bundle") {
	printReport(rows);
	writeBundle(rows);
} else if (command === "check") {
	printReport(rows);
	check(rows);
} else {
	console.error(`unknown command: ${command}`);
	process.exit(1);
}
