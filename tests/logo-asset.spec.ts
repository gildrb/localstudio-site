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

test("footer no longer renders the outline mark", async ({ page }) => {
	await page.goto("/");
	await expect(page.locator("footer .footer__mark")).toHaveCount(0);
	await expect(page.locator('footer img[src="/images/optimized-outline.svg"]')).toHaveCount(0);
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
	const mobile = page.getByRole("navigation", { name: "Landing navigation" }).getByRole("link", { name: "Company" });
	const typography = await mobile.evaluate(element => {
		const style = getComputedStyle(element);
		return [style.fontSize, style.lineHeight];
	});
	expect(typography).toEqual(["14px", "20px"]);
	await page.setViewportSize({ width: 390, height: 844 });
	await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
	await page.getByRole("button", { name: "Open menu" }).click();
	const github = page.getByRole("dialog", { name: "Navigation menu" }).getByRole("link", { name: "GitHub" });
	await expect(github).toHaveAttribute("href", "https://github.com/sybil-solutions/local-studio");
	await expect(github.locator("svg")).toBeVisible();
});

test("site images cannot be copied, dragged, or saved", async ({ page }) => {
	for (const route of ["/", "/product"]) {
		await page.goto(route);
		const result = await page.evaluate(() => {
			const images = [...document.images];
			if (images.length === 0) throw new Error("img");
			const heading = document.querySelector("h1");
			if (!(heading instanceof HTMLElement)) throw new Error("h1");
			const textMenu = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
			heading.dispatchEvent(textMenu);
			return {
				textMenu: textMenu.defaultPrevented,
				images: images.map((image) => {
					const style = getComputedStyle(image);
					const context = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
					const drag = new Event("dragstart", { bubbles: true, cancelable: true });
					const select = new Event("selectstart", { bubbles: true, cancelable: true });
					image.dispatchEvent(context);
					image.dispatchEvent(drag);
					image.dispatchEvent(select);
					return {
						userSelect: style.userSelect,
						drag: style.getPropertyValue("-webkit-user-drag"),
						context: context.defaultPrevented,
						dragStart: drag.defaultPrevented,
						selectStart: select.defaultPrevented,
					};
				}),
			};
		});
		expect(result.textMenu).toBe(false);
		for (const image of result.images) {
			expect(image).toEqual({
				userSelect: "none",
				drag: "none",
				context: true,
				dragStart: true,
				selectStart: true,
			});
		}
	}
});
