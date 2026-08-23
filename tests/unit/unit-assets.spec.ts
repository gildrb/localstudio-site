import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { assets } from "../../src/domain/asset";

function publicPath(file: { path: string }) {
	return `/${file.path.replace(/^public\//, "")}`;
}

test("every registered asset exists in the public asset manifest", () => {
	const manifest = JSON.parse(readFileSync("asset-manifest.json", "utf8"));
	const publicPaths = new Set(manifest.files.map(publicPath));
	for (const path of Object.values(assets)) {
		expect(publicPaths.has(path), path).toBe(true);
	}
});

test("every inventoried public file is registered in the asset model", () => {
	const manifest = JSON.parse(readFileSync("asset-manifest.json", "utf8"));
	const registered = new Set(Object.values(assets));
	for (const file of manifest.files) {
		const path = publicPath(file);
		expect(registered.has(path), path).toBe(true);
	}
});
