import { expect, test } from "@playwright/test";
import type { BrowserFixtures } from "./browser-fixtures";

test("malformed URL hashes do not raise browser errors", async ({ page }: BrowserFixtures) => {
	const errors: string[] = [];
	page.on("pageerror", (error: Readonly<Error>) => errors.push(error.message));

	await page.goto("/#%5B");
	await expect(
		page.getByRole("heading", { level: 1, name: /Intelligence Should Be Owned/u }),
	).toBeVisible();
	await page.waitForTimeout(50);

	expect(errors).toEqual([]);
});
