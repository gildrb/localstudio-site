import { expect, test } from "@playwright/test";

test("header uses the local wordmark asset", async ({ page }) => {
	await page.goto("/");
	const logo = page.locator('.brand img[src="/images/localstudio-logo.svg"]');
	await expect(logo).toBeVisible();
	const response = await page.request.get("/images/localstudio-logo.svg");
	expect(response.ok()).toBeTruthy();
	expect(response.headers()["content-type"]).toContain("image/svg+xml");
	const source = await response.text();
	expect(source).toContain('viewBox="0 0 4667 525"');
	expect(source).toContain('style="fill:#fff;"');
});

test("document uses the local favicon asset", async ({ page }) => {
	await page.goto("/");
	const favicon = page.locator('link[rel="icon"][href="/images/favicon.ico"]');
	await expect(favicon).toHaveCount(1);
	const response = await page.request.get("/images/favicon.ico");
	expect(response.ok()).toBeTruthy();
	expect(response.headers()["content-type"]).toContain("image/x-icon");
});
