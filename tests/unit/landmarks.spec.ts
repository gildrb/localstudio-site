import { readdirSync, readFileSync, type Dirent } from "node:fs";
import { extname, join, relative } from "node:path";
import { expect, test } from "vite-plus/test";

function sourceFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry: Readonly<Dirent>) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) return sourceFiles(path);
		return extname(path) === ".tsx" ? [path] : [];
	});
}

test("site pages own exactly one main landmark and one content id", () => {
	const files = [...sourceFiles("src/pages"), ...sourceFiles("src/components")];
	const mains: string[] = [];
	const contentIds: string[] = [];
	for (const path of files) {
		const projectPath = relative(".", path);
		const source = readFileSync(path, "utf8");
		if (/<main\b/u.test(source)) mains.push(projectPath);
		if (/id=["']content["']/u.test(source)) contentIds.push(projectPath);
	}
	expect(mains).toEqual(["src/components/PageShell.tsx"]);
	expect(contentIds).toEqual(["src/components/PageShell.tsx"]);
});
