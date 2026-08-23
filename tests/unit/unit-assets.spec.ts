import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { assets } from "../../src/domain/asset";

test("every registered asset exists in the public asset manifest", () => {
	const manifest = JSON.parse(readFileSync("asset-manifest.json", "utf8"));
	const publicPaths = new Set(
		manifest.files.map((file: { path: string }) => `/${file.path.replace(/^public\//, "")}`),
	);
	for (const path of Object.values(assets)) {
		expect(publicPaths.has(path), path).toBe(true);
	}
});
