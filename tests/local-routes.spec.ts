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
		page.on("console", (message) => {
			if (message.type() === "error") errors.push(message.text());
		});
		await page.goto(route);
		await expect(page).toHaveTitle(title);
		await expect(
			page.getByRole("heading", { level: 1, name: new RegExp(heading) }),
		).toBeVisible();
		const overflow = await page.evaluate(
			() =>
				document.documentElement.scrollWidth -
				document.documentElement.clientWidth,
		);
		expect(overflow).toBeLessThanOrEqual(0);
		expect(errors).toEqual([]);
	});
}

test("every route uses the useful canonical footer", async ({ page }) => {
	const footerLinks = ["Product", "Mobile", "Docs", "Setup", "Agents", "Download"];
	for (const [route] of routes) {
		await page.goto(route);
		await expect(page.locator("footer")).toContainText("© 2026 Local Studio");
		for (const label of footerLinks) {
			await expect(page.locator("footer").getByRole("link", { name: label, exact: true })).toBeVisible();
		}
	}
});

test("design system typography is stable", async ({ page }) => {
	await page.goto("/");
	const desktop = await page.evaluate(() => {
		const body = getComputedStyle(document.body);
		const title = getComputedStyle(document.querySelector("h1")!);
		const subheadline = getComputedStyle(document.querySelector(".story h2")!);
		const feature = getComputedStyle(document.querySelector(".feature h3")!);
		return {
			body: [body.fontFamily, body.fontSize, body.fontWeight, body.lineHeight, body.letterSpacing],
			title: [title.fontFamily, title.fontSize, title.fontWeight, title.lineHeight, title.letterSpacing],
			subheadline: [subheadline.fontSize, subheadline.fontWeight, subheadline.lineHeight, subheadline.letterSpacing],
			feature: [feature.fontSize, feature.fontWeight, feature.lineHeight, feature.letterSpacing],
		};
	});
	expect(desktop.body).toEqual([expect.stringContaining("Geist Sans"), "16px", "400", "24px", "normal"]);
	expect(desktop.title).toEqual([expect.stringContaining("Geist Sans"), "64px", "500", "64px", "-1.28px"]);
	expect(desktop.subheadline).toEqual(["42px", "500", "48px", "normal"]);
	expect(desktop.feature).toEqual(["42px", "500", "48px", "normal"]);
	await page.goto("/mobile");
	const hierarchy = await page.evaluate(() => {
		const section = getComputedStyle(document.querySelector("h2")!);
		const compact = getComputedStyle(document.querySelector("h3")!);
		return {
			section: [section.fontSize, section.fontWeight, section.lineHeight, section.letterSpacing],
			compact: [compact.fontSize, compact.fontWeight, compact.lineHeight, compact.letterSpacing],
		};
	});
	expect(hierarchy.section).toEqual(["28px", "500", "36px", "normal"]);
	expect(hierarchy.compact).toEqual(["19px", "500", "28px", "normal"]);
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/");
	const mobile = await page.evaluate(() => {
		const title = getComputedStyle(document.querySelector("h1")!);
		const subheadline = getComputedStyle(document.querySelector(".story h2")!);
		return {
			title: [title.fontSize, title.lineHeight, title.letterSpacing],
			subheadline: [subheadline.fontSize, subheadline.lineHeight, subheadline.letterSpacing],
		};
	});
	expect(mobile.title).toEqual(["40px", "44px", "-0.8px"]);
	expect(mobile.subheadline).toEqual(["32px", "40px", "normal"]);
});

test("heading labels are absent", async ({ page }) => {
	for (const [route] of routes) {
		await page.goto(route);
		const findings = await page.locator("h1, h2, h3").evaluateAll(headings =>
			headings.flatMap(heading => {
				const previous = heading.previousElementSibling;
				if (!previous || !["P", "SPAN", "SMALL"].includes(previous.tagName)) return [];
				return [previous.textContent?.trim() || previous.tagName];
			}),
		);
		expect(findings, `${route} contains labels before headings`).toEqual([]);
		const transformed = await page.locator("body *").evaluateAll(elements =>
			elements.filter(element => getComputedStyle(element).textTransform === "uppercase").length,
		);
		expect(transformed, `${route} contains uppercase text treatment`).toBe(0);
	}
});

for (const width of [390, 320]) {
	test(`all routes fit ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 844 });
		for (const [route] of routes) {
			await page.goto(route);
			const sizes = await page.evaluate(() => ({
				client: document.documentElement.clientWidth,
				scroll: document.documentElement.scrollWidth,
			}));
			expect(
				sizes.scroll,
				`${route} overflows at ${width}px`,
			).toBeLessThanOrEqual(sizes.client);
		}
	});
}

test("internal navigation never leaves the local origin", async ({ page }) => {
	await page.goto("/");
	const navigation = page.getByRole("navigation", { name: "Landing navigation" });
	await navigation.getByRole("link", { name: "Mobile", exact: true }).click();
	await expect(page).toHaveURL("/mobile");
	await navigation.getByRole("link", { name: "Docs", exact: true }).click();
	await expect(page).toHaveURL("/docs");
	await navigation.getByRole("link", { name: "Setup", exact: true }).click();
	await expect(page).toHaveURL("/prompt");
	await page.goBack();
	await expect(page).toHaveURL("/docs");
});

test("all Local Studio links resolve locally", async ({ page }) => {
	for (const [route] of routes) {
		await page.goto(route);
		const links = await page
			.locator("a[href]")
			.evaluateAll((anchors) =>
				anchors.map((anchor) => (anchor as HTMLAnchorElement).href),
			);
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
	await expect(
		page.getByRole("heading", { level: 1, name: "This page is not local." }),
	).toBeVisible();
});
