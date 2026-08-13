import { expect, test } from "@playwright/test";

const routes = [
	["/", "Local Studio", "Run your intelligence"],
	["/mobile", "Mobile — Local Studio", "Your local agents"],
	["/docs", "Docs — Local Studio", "Get Local Studio running"],
	["/prompt", "Setup Prompt — Local Studio", "Give this to any coding model"],
	["/agents", "Agents — Local Studio", "Set up the stack"],
	["/download/macos", "Download — Local Studio", "Download for macOS"],
] as const;

for (const [route, title, heading] of routes) {
	test(`${route} loads locally`, async ({ page }) => {
		const errors: string[] = [];
		page.on("console", message => {
			if (message.type() === "error") errors.push(message.text());
		});
		await page.goto(route);
		await expect(page).toHaveTitle(title);
		await expect(page.getByRole("heading", { level: 1, name: new RegExp(heading) })).toBeVisible();
		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
		expect(overflow).toBeLessThanOrEqual(0);
		expect(errors).toEqual([]);
	});
}

for (const width of [390, 320]) {
	test(`all routes fit ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 844 });
		for (const [route] of routes) {
			await page.goto(route);
			const sizes = await page.evaluate(() => ({
				client: document.documentElement.clientWidth,
				scroll: document.documentElement.scrollWidth,
			}));
			expect(sizes.scroll, `${route} overflows at ${width}px`).toBeLessThanOrEqual(sizes.client);
		}
	});
}

test("internal navigation never leaves the local origin", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("link", { name: "Mobile", exact: true }).click();
	await expect(page).toHaveURL("/mobile");
	await page.getByRole("link", { name: "Docs", exact: true }).click();
	await expect(page).toHaveURL("/docs");
	await page.getByRole("link", { name: "Setup", exact: true }).click();
	await expect(page).toHaveURL("/prompt");
	await page.goBack();
	await expect(page).toHaveURL("/docs");
});

test("all Local Studio links resolve locally", async ({ page }) => {
	for (const [route] of routes) {
		await page.goto(route);
		const links = await page.locator("a[href]").evaluateAll(anchors => anchors.map(anchor => (anchor as HTMLAnchorElement).href));
		for (const href of links) {
			const url = new URL(href);
			expect(url.hostname).not.toBe("localstudio.ai");
			if (url.origin === "http://127.0.0.1:4173") {
				const response = await page.request.get(url.href);
				expect(response.ok(), `${url.href} should load locally`).toBeTruthy();
			}
		}
	}
});

test("setup prompt copies", async ({ page, context }) => {
	await context.grantPermissions(["clipboard-read", "clipboard-write"]);
	await page.goto("/prompt");
	await page.getByRole("button", { name: "Copy prompt" }).click();
	await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
	const clipboard = await page.evaluate(() => navigator.clipboard.readText());
	expect(clipboard).toContain("Set up Local Studio completely");
});

test("unknown routes render a local not-found page", async ({ page }) => {
	await page.goto("/not-a-route");
	await expect(page).toHaveTitle("Page not found — Local Studio");
	await expect(page.getByRole("heading", { level: 1, name: "This page is not local." })).toBeVisible();
});
