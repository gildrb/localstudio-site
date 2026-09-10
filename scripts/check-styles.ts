#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import packageJson from "../package.json" with { type: "json" };

const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/u, "");
const inspectDist = process.argv.includes("--dist");
const excludedDirectories = new Set([
	".context",
	".git",
	"dist",
	"node_modules",
	"playwright-report",
	"test-results",
]);
const textExtensions = new Set([
	".css",
	".html",
	".js",
	".json",
	".mjs",
	".ts",
	".tsx",
	".yaml",
	".yml",
]);
const frameworkName = ["tail", "wind"].join("");
const frameworkPattern = new RegExp(frameworkName, "iu");
const frameworkDirective = new RegExp(`@(?:${frameworkName}|apply|config|theme|utility)\\b`, "iu");
const allowedCss = new Set(["src/styles/stylex-entry.css"]);

function walk(directory: string): string[] {
	const files: string[] = [];
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
		const absolute = join(directory, entry.name);
		if (entry.isDirectory()) files.push(...walk(absolute));
		else files.push(absolute);
	}
	return files;
}

function projectFiles(): string[] {
	return walk(root).filter((absolute) => textExtensions.has(extname(absolute)));
}

function collectSourceFailures(absolute: string, source: string): string[] {
	const failures: string[] = [];
	const rel = relative(root, absolute).split("\\").join("/");
	if (frameworkPattern.test(source) || frameworkDirective.test(source)) {
		failures.push(`${rel}: legacy styling framework reference`);
	}
	if (extname(absolute) === ".css") {
		if (!allowedCss.has(rel)) failures.push(`${rel}: authored CSS is not allowed`);
		else if (source.replaceAll(/@font-face\s*\{[^}]*\}/gu, "").trim() !== "")
			failures.push(`${rel}: only font-face declarations belong in the CSS entry`);
	}
	if (rel.startsWith("src/") || rel.startsWith("packages/")) {
		if (rel.endsWith(".tsx")) {
			if (/<[A-Za-z][^>]*\bclassName\s*=/u.test(source))
				failures.push(`${rel}: literal className styling is not allowed`);
			if (/<[A-Za-z][^>]*\bstyle\s*=/u.test(source))
				failures.push(`${rel}: JSX inline style is not allowed`);
		}
		if (/\.classList\b/u.test(source))
			failures.push(`${rel}: runtime class mutation is not allowed`);
		if (/\.style(?:\.|\[)/u.test(source))
			failures.push(`${rel}: runtime inline style mutation is not allowed`);
		if (/var\(\s*--/u.test(source))
			failures.push(`${rel}: untyped CSS custom-property access is not allowed`);
		if (/<style(?:\s|>)/iu.test(source)) failures.push(`${rel}: raw style blocks are not allowed`);
	}
	if (rel.endsWith(".html") && /<style(?:\s|>)/iu.test(source)) {
		failures.push(`${rel}: raw style blocks are not allowed`);
	}
	if (
		/from\s+["'][^"']+\.css["']|import\s+["'][^"']+\.css["']/u.test(source) &&
		rel !== "src/main.tsx"
	) {
		failures.push(`${rel}: CSS imports are not allowed`);
	}
	return failures;
}

function assertSourceContract(): void {
	const failures: string[] = [];
	const files = projectFiles();
	let createCalls = 0;
	let propsCalls = 0;
	let typedVariables = 0;
	let variableGroups = 0;
	for (const absolute of files) {
		const source = readFileSync(absolute, "utf8");
		failures.push(...collectSourceFailures(absolute, source));
		createCalls += source.match(/stylex\.create\s*\(/gu)?.length ?? 0;
		propsCalls += source.match(/stylex\.props\s*\(/gu)?.length ?? 0;
		typedVariables += source.match(/stylex\.types\.[a-zA-Z]+\s*\(/gu)?.length ?? 0;
		variableGroups += source.match(/stylex\.define(?:Vars|Consts)\s*\(/gu)?.length ?? 0;
	}
	if (!Object.hasOwn(packageJson.dependencies, "@stylexjs/stylex")) {
		failures.push("package.json: missing @stylexjs/stylex runtime");
	}
	for (const dependency of ["@stylexjs/unplugin"]) {
		if (!Object.hasOwn(packageJson.devDependencies, dependency)) {
			failures.push(`package.json: missing ${dependency}`);
		}
	}
	if (createCalls < 20) failures.push(`StyleX coverage is too low: ${createCalls} create calls`);
	if (propsCalls < 40) failures.push(`StyleX coverage is too low: ${propsCalls} props calls`);
	if (typedVariables < 10)
		failures.push(`StyleX typed-variable coverage is too low: ${typedVariables} typed values`);
	if (variableGroups < 2)
		failures.push(`StyleX token coverage is too low: ${variableGroups} variable groups`);
	if (failures.length > 0) throw new Error(failures.join("\n"));
	console.log(
		`StyleX source contract passed: ${createCalls} create, ${propsCalls} props, ${typedVariables} typed values, ${variableGroups} token groups`,
	);
}

function assertBuildContract(): void {
	const dist = join(root, "dist");
	if (!statSync(join(dist, "index.html")).isFile())
		throw new Error("StyleX build check needs dist/index.html");
	const files = walk(dist).filter((absolute) => textExtensions.has(extname(absolute)));
	const css = files.filter((absolute) => extname(absolute) === ".css");
	if (css.length === 0) throw new Error("StyleX build emitted no CSS asset");
	const output = files.map((absolute) => readFileSync(absolute, "utf8")).join("\n");
	const legacyVariable = new RegExp(`--${["t", "w"].join("")}-`, "iu");
	if (frameworkPattern.test(output) || legacyVariable.test(output)) {
		throw new Error("StyleX build contains legacy framework output");
	}
	if (!/@layer priority\d/u.test(output) || !/\.x[a-zA-Z0-9_-]+\s*\{/u.test(output)) {
		throw new Error("StyleX atomic output was not found in the production CSS");
	}
	console.log(
		`StyleX build contract passed: ${css.length} CSS asset${css.length === 1 ? "" : "s"}`,
	);
}

assertSourceContract();
if (inspectDist) assertBuildContract();
