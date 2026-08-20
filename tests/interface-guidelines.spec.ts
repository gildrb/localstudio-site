import { expect, test } from "@playwright/test";

const routes = [
	"/",
	"/product",
	"/mobile",
	"/docs",
	"/prompt",
	"/agents",
	"/download/macos",
];

test("typography and interaction motion use the global interface policy", async ({
	page,
}) => {
	for (const route of routes) {
		await page.goto(route);
		const audit = await page.evaluate(() => {
			const root = getComputedStyle(document.documentElement);
			const interactive = [
				...document.querySelectorAll<HTMLElement>(
					'a, button, input, textarea, select, summary, [role="button"]',
				),
			];
			const durations = interactive.flatMap((element) =>
				getComputedStyle(element)
					.transitionDuration.split(",")
					.map((value) =>
						value.trim().endsWith("ms")
							? Number.parseFloat(value)
							: Number.parseFloat(value) * 1000,
					),
			);
			const weights = [
				...document.querySelectorAll<HTMLElement>("h1, h2, h3, p, a, button"),
			]
				.map((element) =>
					Number.parseFloat(getComputedStyle(element).fontWeight),
				)
				.filter(Number.isFinite);
			const missingIconLabels = interactive.filter(
				(element) =>
					element.matches("a, button") &&
					!(element.textContent ?? "").trim() &&
					!element.getAttribute("aria-label"),
			).length;
			return {
				fontSmoothing: root.getPropertyValue("-webkit-font-smoothing"),
				textRendering: root.textRendering,
				textSizeAdjust: root.getPropertyValue("-webkit-text-size-adjust"),
				maxDuration: Math.max(0, ...durations),
				minWeight: Math.min(...weights),
				missingIconLabels,
			};
		});
		expect(audit, route).toEqual({
			fontSmoothing: "antialiased",
			textRendering: "optimizelegibility",
			textSizeAdjust: "100%",
			maxDuration: expect.any(Number),
			minWeight: expect.any(Number),
			missingIconLabels: 0,
		});
		expect(
			audit.maxDuration,
			`${route} interaction duration`,
		).toBeLessThanOrEqual(200);
		expect(
			audit.minWeight,
			`${route} minimum font weight`,
		).toBeGreaterThanOrEqual(400);
	}
});

test("the hero composer uses native form semantics without disabled tooltips", async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/");
	const composer = page.getByRole("textbox", { name: "Message" });
	await expect(composer).toHaveAttribute("id", "hero-demo-composer");
	await expect(composer).toHaveAttribute("name", "message");
	await expect(composer).toHaveAttribute("autocomplete", "off");
	expect(
		await composer.evaluate((element) =>
			Number.parseFloat(getComputedStyle(element).fontSize),
		),
	).toBeGreaterThanOrEqual(16);
	await expect(page.getByRole("button", { name: "Send" })).toBeDisabled();
	await expect(page.getByRole("button", { name: "Send" })).not.toHaveAttribute(
		"title",
	);
	await expect(
		page.getByRole("button", { name: "Fork from this point" }),
	).toBeDisabled();
	await expect(
		page.getByRole("button", { name: "Fork from this point" }),
	).not.toHaveAttribute("title");
});

test("looping demonstrations stop when they leave the viewport", async ({
	page,
}) => {
	await page.goto("/");
	await expect
		.poll(() =>
			page
				.locator(".hero__hearth")
				.evaluate(
					(element) =>
						element
							.getAnimations({ subtree: true })
							.filter((animation) => animation.playState === "running").length,
				),
		)
		.toBeGreaterThan(0);
	await page.evaluate(() =>
		window.scrollTo(0, document.documentElement.scrollHeight),
	);
	await expect
		.poll(() =>
			page
				.locator(".hero__hearth")
				.evaluate(
					(element) =>
						element
							.getAnimations({ subtree: true })
							.filter((animation) => animation.playState === "running").length,
				),
		)
		.toBe(0);
	const heroDemo = page.locator(".hero .demo:not(.hero__demo-placeholder)");
	await expect(heroDemo).toHaveAttribute("data-active", "false");
	const heroPhase = await heroDemo.getAttribute("data-phase");
	await page.waitForTimeout(3200);
	await expect(heroDemo).toHaveAttribute("data-phase", heroPhase ?? "");

	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/mobile");
	const demo = page.locator(".mobile-connection-demo");
	await demo.scrollIntoViewIfNeeded();
	await expect.poll(() => demo.getAttribute("data-phase")).not.toBe("0");
	await page.evaluate(() =>
		window.scrollTo(0, document.documentElement.scrollHeight),
	);
	await page.waitForTimeout(100);
	const pausedPhase = await demo.getAttribute("data-phase");
	await page.waitForTimeout(2200);
	await expect(demo).toHaveAttribute("data-phase", pausedPhase ?? "");
});

test("reduced motion is immediate and touch controls remain visible", async ({
	browser,
}) => {
	const context = await browser.newContext({
		hasTouch: true,
		isMobile: true,
		reducedMotion: "reduce",
		viewport: { width: 390, height: 844 },
	});
	const page = await context.newPage();
	await page.goto("/prompt");
	await expect(page.locator(".copy-icon")).toHaveCSS("opacity", "1");
	const motion = await page.evaluate(() => {
		const target = document.querySelector<HTMLElement>(".prompt-block__toggle");
		if (!target) throw new Error("prompt toggle");
		const style = getComputedStyle(target);
		return {
			duration: Math.max(
				...style.transitionDuration
					.split(",")
					.map((value) =>
						value.trim().endsWith("ms")
							? Number.parseFloat(value)
							: Number.parseFloat(value) * 1000,
					),
			),
			delay: style.transitionDelay,
			scroll: getComputedStyle(document.documentElement).scrollBehavior,
		};
	});
	expect(motion.delay).toBe("0s");
	expect(motion.duration).toBeLessThanOrEqual(0.01);
	expect(motion.scroll).toBe("auto");
	await context.close();
});

test("navigation lists have continuous hit areas", async ({
	browser,
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/");
	await page.getByRole("button", { name: "Resources" }).hover();
	await expect(page.locator(".nav__menu-items").first()).toHaveCSS(
		"row-gap",
		"0px",
	);
	const firstMenuItem = page.getByRole("menuitem", {
		name: "Overview",
		exact: true,
	});
	await firstMenuItem.focus();
	await page.keyboard.press("ArrowDown");
	await expect(
		page.getByRole("menuitem", { name: "Setup", exact: true }),
	).toBeFocused();

	const context = await browser.newContext({
		hasTouch: true,
		isMobile: true,
		viewport: { width: 390, height: 844 },
	});
	const mobile = await context.newPage();
	await mobile.goto("/");
	await mobile.getByRole("button", { name: "Open menu" }).click();
	await mobile
		.getByRole("navigation", { name: "Mobile navigation" })
		.getByText("Resources", { exact: true })
		.click();
	const links = mobile.locator(".nav__sheet-group[open] .nav__sheet-items a");
	const boxes = await links.evaluateAll((elements) =>
		elements.map((element) => {
			const box = element.getBoundingClientRect();
			return { top: box.top, bottom: box.bottom };
		}),
	);
	for (let index = 1; index < boxes.length; index += 1) {
		expect(boxes[index]?.top).toBe(boxes[index - 1]?.bottom);
	}
	await context.close();
});

test("the favicon follows the system color scheme", async ({ page }) => {
	await page.goto("/");
	await expect(
		page.locator('link[rel="icon"][type="image/svg+xml"]'),
	).toHaveAttribute("href", "/images/favicon.svg");
	const response = await page.request.get("/images/favicon.svg");
	expect(response.ok()).toBe(true);
	expect(await response.text()).toContain(
		"@media (prefers-color-scheme: dark)",
	);
});
