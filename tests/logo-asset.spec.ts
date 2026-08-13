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

test("hero uses the local standalone mark", async ({ page }) => {
	await page.goto("/");
	const mark = page.locator('.hero__mark[src="/images/optimized.svg"]');
	await expect(mark).toBeVisible();
	const response = await page.request.get("/images/optimized.svg");
	expect(response.ok()).toBeTruthy();
	expect(response.headers()["content-type"]).toContain("image/svg+xml");
	const source = await response.text();
	expect(source).toContain('viewBox="0 0 525 525"');
});

test("footer uses the local outline mark", async ({ page }) => {
	await page.goto("/");
	const mark = page.locator('footer .footer__mark[src="/images/optimized-outline.svg"]');
	await expect(mark).toBeVisible();
	await expect(mark).toHaveAttribute("aria-hidden", "true");
	const response = await page.request.get("/images/optimized-outline.svg");
	expect(response.ok()).toBeTruthy();
	const source = await response.text();
	expect(source).toContain('fill="none"');
	expect(source).toContain('stroke="#767676"');
	expect(source).toContain('vector-effect="non-scaling-stroke"');
});

test("document uses the local favicon asset", async ({ page }) => {
	await page.goto("/");
	const favicon = page.locator('link[rel="icon"][href="/images/favicon.ico"]');
	await expect(favicon).toHaveCount(1);
	const response = await page.request.get("/images/favicon.ico");
	expect(response.ok()).toBeTruthy();
	expect(response.headers()["content-type"]).toContain("image/x-icon");
});

test("navbar uses compact text and an accessible GitHub icon", async ({ page }) => {
	await page.goto("/");
	const mobile = page.getByRole("navigation", { name: "Landing navigation" }).getByRole("link", { name: "Mobile" });
	const typography = await mobile.evaluate(element => {
		const style = getComputedStyle(element);
		return [style.fontSize, style.lineHeight];
	});
	expect(typography).toEqual(["14px", "20px"]);
	await page.setViewportSize({ width: 390, height: 844 });
	await expect(mobile).toBeVisible();
	const github = page.getByRole("link", { name: "Local Studio on GitHub" });
	await expect(github).toHaveAttribute("href", "https://github.com/sybil-solutions/local-studio");
	await expect(github.locator("svg")).toBeVisible();
});
