import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { expect, test } from "@playwright/test";

const SOURCE_EXTENSIONS = new Set([".css", ".ts", ".tsx"]);

function sourceFiles(directory) {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) return sourceFiles(path);
		return SOURCE_EXTENSIONS.has(extname(path)) ? [path] : [];
	});
}

test("page colors use reusable tokens instead of loose hex literals", () => {
	const violations = sourceFiles("src").flatMap((path) => {
		const projectPath = relative(".", path);
		if (projectPath.startsWith("src/ls/")) return [];
		const source = readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
		return source.split("\n").flatMap((line, index) => {
			const code = line.replace(/\/\/.*$/, "");
			if (/^\s*--[\w-]+\s*:/.test(code)) return [];
			const colors = code.match(/(?<!&)#[\da-f]{3,8}\b/gi);
			return (
				colors?.map((color) => `${projectPath}:${index + 1} ${color}`) ?? []
			);
		});
	});

	expect(violations).toEqual([]);
});
