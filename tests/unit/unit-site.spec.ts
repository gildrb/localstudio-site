import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { expect, test } from "@playwright/test";
import { site } from "../../src/domain/site";

function sourceFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) return sourceFiles(path);
		return extname(path) === ".ts" || extname(path) === ".tsx" ? [path] : [];
	});
}

test("first-party source does not hardcode product URLs outside site.ts", () => {
	const forbidden = [
		site.company.url,
		site.company.alias,
		site.company.github,
		site.company.contact,
		site.company.x,
		site.products.localStudio.repository,
		site.products.kittyLitter.url,
		site.products.kittyLitter.appStore,
		site.products.kittyLitter.playStore,
		site.products.kittyLitter.source,
		site.products.localAi.url,
		site.products.codexShim.repository,
	];
	const violations: string[] = [];
	for (const path of sourceFiles("src")) {
		if (path.endsWith("src/domain/site.ts")) continue;
		const source = readFileSync(path, "utf8");
		for (const value of forbidden) {
			if (source.includes(value)) violations.push(`${path} ${value}`);
		}
	}
	expect(violations).toEqual([]);
});
