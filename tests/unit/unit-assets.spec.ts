import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";
import manifest from "../../asset-manifest.json" with { type: "json" };
import { assets } from "../../src/domain/asset";

function publicPath(file: { path: string }) {
	return `/${file.path.replace(/^public\//, "")}`;
}

function sourceFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) return sourceFiles(path);
		return [path];
	});
}

test("every registered asset exists in the public asset manifest", () => {
	const publicPaths = new Set(manifest.files.map(publicPath));
	for (const path of Object.values(assets)) {
		expect(publicPaths.has(path), path).toBe(true);
	}
});

test("every inventoried public file is registered in the asset model", () => {
	const registered = new Set<string | undefined>(Object.values(assets));
	for (const file of manifest.files) {
		const path = publicPath(file);
		expect(registered.has(path), path).toBe(true);
	}
});

test("asset manifest records media types and image dimensions", () => {
	for (const file of manifest.files) {
		const typeMatcher: unknown = expect.any(String);
		expect(file.type, file.path).toEqual(typeMatcher);
		if (file.role === "image" || file.role === "icon" || file.role === "sponsor") {
			const widthMatcher: unknown = expect.any(Number);
			const heightMatcher: unknown = expect.any(Number);
			expect(file.dimensions, file.path).toEqual({
				width: widthMatcher,
				height: heightMatcher,
			});
		} else {
			expect(file.dimensions, file.path).toBeNull();
		}
	}
});

test("source public asset references belong to the asset registry", () => {
	const registered = new Set<string | undefined>(Object.values(assets));
	const references = /["'(]((?:\/images|\/fonts|\/localai)\/[^"'\s)]+)/g;
	const violations: string[] = [];
	for (const root of ["src", "packages"]) {
		for (const path of sourceFiles(root)) {
			if (!/[.]([cm]?[jt]sx?|css|mjs)$/.test(path)) continue;
			const source = readFileSync(path, "utf8");
			for (const match of source.matchAll(references)) {
				if (!registered.has(match[1])) violations.push(`${path}: ${match[1]}`);
			}
		}
	}
	expect(violations).toEqual([]);
});
